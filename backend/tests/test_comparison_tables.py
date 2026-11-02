"""Regression tests for comparison-table persistence.

Guards against the production failure where ``POST /api/comparisons`` (and
the dashboard ``GET``) returned 500 with::

    relation "ComparisonReport" does not exist

The Prisma schema declared the ``ComparisonReport`` / ``ComparisonCandidate``
models, but no migration created the tables, so every SQLAlchemy write
failed. These tests pin the three artifacts that must stay in sync:

1. a Prisma migration that creates both tables,
2. the idempotent backend ensure helper used at startup / from scripts,
3. the SQLAlchemy model columns covered by that DDL.

They need no live database.
"""

from __future__ import annotations

from collections.abc import Coroutine
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
MIGRATIONS_DIR = REPO_ROOT / "prisma" / "migrations"

EXPECTED_TABLES = ("ComparisonReport", "ComparisonCandidate")


def _run_coro(coro: Coroutine[Any, Any, None]) -> None:
    """Drive an I/O-free coroutine to completion without an event loop.

    ``asyncio.run`` needs loopback sockets, which locked-down environments
    forbid; the fake session below never suspends on real I/O, so a single
    ``send`` completes it.
    """
    try:
        coro.send(None)
    except StopIteration:
        return
    raise AssertionError("coroutine unexpectedly suspended on real I/O")


def _comparison_migration_sql() -> str:
    """Return the migration SQL that creates the comparison tables.

    Raises AssertionError when no migration covers them (the original bug).
    """
    candidates = sorted(MIGRATIONS_DIR.glob("*/migration.sql"))
    assert candidates, "no Prisma migrations found at all"
    for path in candidates:
        sql = path.read_text(encoding="utf-8")
        if all(f'CREATE TABLE "{t}"' in sql for t in EXPECTED_TABLES):
            return sql
    raise AssertionError(
        "no Prisma migration creates ComparisonReport + ComparisonCandidate; "
        "applying migrations leaves the comparison API broken (500)"
    )


def test_prisma_migration_creates_comparison_tables() -> None:
    sql = _comparison_migration_sql()
    for table in EXPECTED_TABLES:
        assert f'CREATE TABLE "{table}"' in sql
    # Key columns the API reads/writes must exist in the DDL.
    for column in (
        '"reportNumber"',
        '"userId"',
        '"methodologyVersion"',
        '"selectedWeights"',
        '"recommendation"',
        '"paretoFrontier"',
        '"dataComparability"',
        '"executiveTakeaway"',
        '"comparisonId"',
        '"candidatePosition"',
        '"ideaTitle"',
    ):
        assert column in sql, f"migration DDL is missing column {column}"


def test_ensure_comparison_tables_runs_idempotent_ddl() -> None:
    from backend.scripts.create_comparison_tables import (
        STATEMENTS,
        ensure_comparison_tables,
    )

    assert len(STATEMENTS) >= 2

    executed: list[str] = []
    commits = 0

    class FakeSession:
        async def execute(self, stmt):
            executed.append(str(stmt))

        async def commit(self):
            nonlocal commits
            commits += 1

    _run_coro(ensure_comparison_tables(FakeSession()))  # type: ignore[arg-type]

    assert len(executed) == len(STATEMENTS)
    assert commits == 1
    joined = "\n".join(executed)
    for table in EXPECTED_TABLES:
        assert f'"{table}"' in joined
    # Startup-safe: re-running must never fail on existing objects.
    for stmt in executed:
        upper = stmt.upper()
        assert (
            "IF NOT EXISTS" in upper or "CREATE INDEX" in upper or "DO $$" in upper
        ), f"statement is not idempotent: {stmt[:80]}..."
    # A Prisma @@unique migration creates a bare UNIQUE INDEX with no
    # pg_constraint row, so the unique-constraint guard must also consult
    # the index catalog or restarts fail with "relation already exists".
    unique_stmts = [
        s for s in executed if "ComparisonCandidate_comparisonId_ideaId_key" in s
    ]
    assert unique_stmts, "ensure DDL lost the comparisonId/ideaId uniqueness guard"
    for stmt in unique_stmts:
        if stmt.lstrip().upper().startswith("DO $$"):
            upper = stmt.upper()
            assert "PG_CLASS" in upper or "PG_INDEX" in upper, (
                "unique-constraint guard ignores bare UNIQUE INDEXes: "
                f"{stmt[:80]}..."
            )


def test_sqlalchemy_models_match_migration_columns() -> None:
    from backend.models.comparison import (
        ComparisonCandidateModel,
        ComparisonReportModel,
    )

    sql = _comparison_migration_sql()
    models = (ComparisonReportModel, ComparisonCandidateModel)
    for model in models:
        assert model.__tablename__ in EXPECTED_TABLES
        for column in model.__table__.columns:
            assert f'"{column.name}"' in sql, (
                f"column {model.__tablename__}.{column.name} has no migration DDL"
            )
