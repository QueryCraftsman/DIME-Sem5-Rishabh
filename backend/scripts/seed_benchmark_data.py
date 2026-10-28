"""
Seed script to populate benchmark ideas and comparisons matching the DIME AI Enterprise product requirements.
"""

import asyncio
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, text
from backend.core.database import async_session_factory
from backend.models.analysis import Analysis, AnalysisStatus
from backend.models.scoring import AnalysisScore
from backend.models.evidence import Finding, Evidence
from backend.models.comparison import ComparisonReportModel, ComparisonCandidateModel
from backend.services.comparison_engine import comparison_engine

USER_ID = "cmvo96z5i0001tyuy67qpagw3"

BENCHMARK_IDEAS = [
    {
        "id": "idea-pr-reviewer",
        "title": "Autonomous PR Code Reviewer",
        "description": "Automated deterministic abstract syntax tree (AST) reasoning engine for real-time pull request gatekeeping and ambient code analysis.",
        "industry": "Developer Tools & AI/ML",
        "status": "VALIDATED",
        "viability": 8.8,
        "novelty": 82.0,
        "market_pain": 92.0,
        "feasibility": 81.0,
        "competition": 64.0,
        "risk": 32.0,
        "sources": 38,
        "analysis_status": AnalysisStatus.COMPLETED,
    },
    {
        "id": "idea-crm-copilot",
        "title": "CRM Voice Copilot",
        "description": "Real-time conversational intelligence assistant extracting B2B sales objections and updating deal state in CRM schemas with zero manual rep latency.",
        "industry": "Enterprise B2B SaaS",
        "status": "VALIDATED",
        "viability": 8.4,
        "novelty": 60.0,
        "market_pain": 87.0,
        "feasibility": 74.0,
        "competition": 88.0,
        "risk": 58.0,
        "sources": 29,
        "analysis_status": AnalysisStatus.COMPLETED,
    },
    {
        "id": "idea-ast-gatekeeper",
        "title": "AST Schema Gatekeeper",
        "description": "Deterministic semantic compiler enforcing microservice schema boundaries and breaking-change guards inside pre-merge git hooks.",
        "industry": "Developer Infrastructure",
        "status": "VALIDATED",
        "viability": 7.9,
        "novelty": 79.0,
        "market_pain": 83.0,
        "feasibility": 85.0,
        "competition": 52.0,
        "risk": 41.0,
        "sources": 22,
        "analysis_status": AnalysisStatus.COMPLETED,
    },
    {
        "id": "idea-api-doc-synthesizer",
        "title": "API Doc Synthesizer",
        "description": "Reverse engineers OpenAPI 3.1 contracts and ambient interactive sandboxes directly from live endpoint request traces and distributed telemetry spans.",
        "industry": "Developer Tools",
        "status": "VALIDATED",
        "viability": 7.6,
        "novelty": 68.0,
        "market_pain": 78.0,
        "feasibility": 84.0,
        "competition": 71.0,
        "risk": 35.0,
        "sources": 19,
        "analysis_status": AnalysisStatus.COMPLETED,
    },
    {
        "id": "idea-deal-risk-radar",
        "title": "Deal Risk Radar",
        "description": "Pipeline sentiment radar analyzing multi-stakeholder email velocity and executive engagement decay to flag mid-quarter slippage.",
        "industry": "B2B FinTech & Sales",
        "status": "VALIDATED",
        "viability": 8.1,
        "novelty": 74.0,
        "market_pain": 86.0,
        "feasibility": 77.0,
        "competition": 81.0,
        "risk": 49.0,
        "sources": 25,
        "analysis_status": AnalysisStatus.COMPLETED,
    },
    {
        "id": "idea-soc2-validator",
        "title": "SOC2 Continuous Validator",
        "description": "Zero-trust cloud infrastructure compliance auditor continuously proving security control parity across Kubernetes deployments.",
        "industry": "Compliance & Security",
        "status": "ANALYZING",
        "viability": None,
        "novelty": None,
        "market_pain": None,
        "feasibility": None,
        "competition": None,
        "risk": None,
        "sources": 14,
        "analysis_status": AnalysisStatus.RUNNING,
    },
    {
        "id": "idea-prompt-shield",
        "title": "Prompt Injection Shield",
        "description": "In-line adversarial sanitizer and latency-free tokenizer firewall intercepting prompt injection payloads on LLM tool-calling paths.",
        "industry": "CyberSecurity",
        "status": "DRAFT",
        "viability": None,
        "novelty": None,
        "market_pain": None,
        "feasibility": None,
        "competition": None,
        "risk": None,
        "sources": 0,
        "analysis_status": None,
    },
    {
        "id": "idea-audit-vault",
        "title": "Audit Trail Vault",
        "description": "Cryptographic tamper-evident distributed ledger storing compliance audit logs across enterprise multi-tenant databases.",
        "industry": "Cryptographic Storage",
        "status": "REJECTED",
        "viability": None,
        "novelty": None,
        "market_pain": None,
        "feasibility": None,
        "competition": None,
        "risk": None,
        "sources": 5,
        "analysis_status": AnalysisStatus.FAILED,
    },
]


async def seed():
    async with async_session_factory() as session:
        print("Checking user existence...")
        user_res = await session.execute(
            text('SELECT id FROM "User" WHERE id = :uid'), {"uid": USER_ID}
        )
        if not user_res.fetchone():
            print("Creating default user...")
            await session.execute(
                text(
                    'INSERT INTO "User" (id, name, email, "updatedAt") VALUES (:uid, :name, :email, NOW())'
                ),
                {"uid": USER_ID, "name": "Alex Morgan", "email": "alex.morgan@dime.ai"},
            )
            await session.commit()

        # Seed ideas
        print("Seeding benchmark ideas...")
        for item in BENCHMARK_IDEAS:
            existing_idea = await session.execute(
                text('SELECT id FROM "Idea" WHERE id = :id'), {"id": item["id"]}
            )
            if not existing_idea.fetchone():
                await session.execute(
                    text(
                        'INSERT INTO "Idea" (id, title, description, industry, "targetAudience", status, '
                        '"overallViability", "noveltyScore", "marketPainScore", "feasibilityScore", '
                        '"competitionLevel", "userId", "createdAt", "updatedAt") '
                        "VALUES (:id, :title, :description, :industry, :aud, :status, :viability, "
                        ":novelty, :pain, :feas, :comp, :uid, NOW(), NOW())"
                    ),
                    {
                        "id": item["id"],
                        "title": item["title"],
                        "description": item["description"],
                        "industry": item["industry"],
                        "aud": "B2B Enterprise",
                        "status": item["status"],
                        "viability": item["viability"],
                        "novelty": item["novelty"],
                        "pain": item["market_pain"],
                        "feas": item["feasibility"],
                        "comp": item["competition"],
                        "uid": USER_ID,
                    },
                )
                await session.commit()

            # Seed Analysis record if applicable
            if item["analysis_status"]:
                existing_analysis = await session.execute(
                    select(Analysis).where(Analysis.idea_id == item["id"])
                )
                a = existing_analysis.scalar()
                if not a:
                    a = Analysis(
                        idea_id=item["id"],
                        user_id=USER_ID,
                        title=item["title"],
                        description=item["description"],
                        domain=item["industry"],
                        target_audience="Enterprise Developers / CROs",
                        status=item["analysis_status"],
                        current_stage="COMPLETED" if item["analysis_status"] == AnalysisStatus.COMPLETED else "SYNTHESIZING",
                        progress=100 if item["analysis_status"] == AnalysisStatus.COMPLETED else 65,
                        sources_attempted=item["sources"] + 2,
                        sources_succeeded=item["sources"],
                        started_at=datetime.now(timezone.utc) - timedelta(days=14),
                        completed_at=datetime.now(timezone.utc) - timedelta(days=14) if item["analysis_status"] == AnalysisStatus.COMPLETED else None,
                    )
                    session.add(a)
                    await session.flush()

                    # Add scores
                    if item["viability"] is not None:
                        scores_to_add = [
                            ("Novelty", item["novelty"]),
                            ("Market Pain", item["market_pain"]),
                            ("Feasibility", item["feasibility"]),
                            ("Market Saturation", item["competition"]),
                            ("Risk Indicator", item["risk"]),
                            ("Opportunity", round((item["novelty"] + item["market_pain"]) / 2, 2)),
                        ]
                        for m_name, score_val in scores_to_add:
                            session.add(
                                AnalysisScore(
                                    analysis_id=a.id,
                                    metric_name=m_name,
                                    score=score_val,
                                    status="completed",
                                    calculation_version="v3.4",
                                    explanation=f"Deterministic {m_name} computation based on validated corpus.",
                                )
                            )
                        await session.commit()

        # Seed initial saved comparisons if table is empty
        report_count_res = await session.execute(select(ComparisonReportModel))
        existing_reports = report_count_res.scalars().all()
        if len(existing_reports) == 0:
            print("Seeding initial comparison reports matching Reference Screen 1 & 3...")
            # 1. Report 1: Q4 2026 Developer Tooling Trade-Off
            rep1 = await comparison_engine.execute_comparison(
                db=session,
                user_id=USER_ID,
                idea_ids=["idea-pr-reviewer", "idea-ast-gatekeeper", "idea-api-doc-synthesizer"],
                title="Q4 2026 Developer Tooling Trade-Off",
                description="Benchmarking synthesis runtime against enterprise AST security hurdles.",
                objective_key="feasibility",
            )
            print(f"Created report 1: {rep1.id}")

            # 2. Report 2: B2B Sales Intelligence Feasibility Audit (#CMP-2026-002)
            rep2 = await comparison_engine.execute_comparison(
                db=session,
                user_id=USER_ID,
                idea_ids=["idea-pr-reviewer", "idea-crm-copilot"],
                title="B2B Sales Intelligence Feasibility Audit",
                description="High-touch mid-market TAM and LLM latency tolerance study.",
                objective_key="mvp",
            )
            print(f"Created report 2: {rep2.id}")

            # 3. Report 3: Enterprise Compliance & Security Wedge (Draft)
            rep3 = ComparisonReportModel(
                id="cmp-sec-wedge-draft",
                userId=USER_ID,
                title="Enterprise Compliance & Security Wedge",
                description="Evaluating regulatory moat and defense depth across four prototypes.",
                objective="Prioritize long-term growth potential",
                status="DRAFT",
                methodologyVersion="Multi-Vector Pareto Synthesis v3.4",
                candidatesCount=4,
                createdAt=datetime.now(timezone.utc) - timedelta(days=26),
                updatedAt=datetime.now(timezone.utc) - timedelta(days=26),
            )
            session.add(rep3)
            await session.commit()

            cands_draft = [
                ("idea-soc2-validator", 1, "SOC2 Continuous Validator", "Compliance & Security"),
                ("idea-prompt-shield", 2, "Prompt Injection Shield", "CyberSecurity"),
                ("idea-ast-gatekeeper", 3, "PII Data Sanitizer", "Data Privacy"),
                ("idea-audit-vault", 4, "Audit Trail Vault", "Cryptographic Storage"),
            ]
            for iid, pos, t, dom in cands_draft:
                cand = ComparisonCandidateModel(
                    id=f"cand-draft-{pos}",
                    comparisonId=rep3.id,
                    ideaId=iid,
                    analysisId=f"ana-{iid}",
                    candidatePosition=pos,
                    ideaTitle=t,
                    ideaDomain=dom,
                    sourcesCount=16,
                    createdAt=datetime.now(timezone.utc) - timedelta(days=26),
                )
                session.add(cand)
            await session.commit()
            print("Created report 3 (Draft).")

        print("Seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
