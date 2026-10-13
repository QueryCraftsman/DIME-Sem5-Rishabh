"""
GitHub Adapter.
Transforms native GitHub API JSON into DIME's internal SourceDocument representation.
"""

from datetime import UTC, datetime
from typing import Any

import dateutil.parser
from backend.schemas.source import SourceDocument


class GitHubAdapter:
    """Pure transformation layer for GitHub data."""

    @staticmethod
    def _parse_date(date_str: str | None) -> datetime | None:
        if not date_str:
            return None
        try:
            return dateutil.parser.isoparse(date_str)
        except Exception:
            return None

    @classmethod
    def normalize_repository(
        cls, repo_data: dict[str, Any], readme_text: str | None = None
    ) -> SourceDocument:
        """
        Convert a GitHub repository dictionary into a SourceDocument.
        """
        # Identity
        repo_id = str(repo_data.get("id"))
        owner = repo_data.get("owner", {}).get("login", "")
        repo_name = repo_data.get("name", "")
        full_name = repo_data.get("full_name", f"{owner}/{repo_name}")
        html_url = repo_data.get("html_url")

        # Textual representation
        description = repo_data.get("description") or ""
        text_parts = []
        if description:
            text_parts.append(f"Description: {description}")
        if readme_text:
            text_parts.append(f"README:\n{readme_text}")

        full_text = "\n\n".join(text_parts) if text_parts else None

        # Parse dates
        created_at = cls._parse_date(repo_data.get("created_at"))
        updated_at = cls._parse_date(repo_data.get("updated_at"))
        pushed_at = cls._parse_date(repo_data.get("pushed_at"))

        # Build metadata
        metadata = {
            "owner": owner,
            "full_name": full_name,
            "stars": repo_data.get("stargazers_count", 0),
            "forks": repo_data.get("forks_count", 0),
            "language": repo_data.get("language"),
            "topics": repo_data.get("topics", []),
            "open_issues": repo_data.get("open_issues_count", 0),
            "archived": repo_data.get("archived", False),
            "created_at": created_at.isoformat() if created_at else None,
            "updated_at": updated_at.isoformat() if updated_at else None,
            "pushed_at": pushed_at.isoformat() if pushed_at else None,
        }

        # License handling
        license_info = repo_data.get("license")
        if isinstance(license_info, dict):
            metadata["license"] = license_info.get("spdx_id") or license_info.get("name")

        return SourceDocument(
            source="github",
            source_id=repo_id,
            entity_type="repository",
            title=full_name,
            text=full_text,
            url=html_url,
            published_at=created_at,
            retrieved_at=datetime.now(UTC),
            metadata=metadata,
        )
