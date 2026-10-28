import asyncio
from backend.core.database import async_session_factory
from backend.models.analysis import Analysis
from backend.models.scoring import AnalysisScore
from backend.models.evidence import Finding, Evidence
from sqlalchemy import select, text

async def main():
    async with async_session_factory() as session:
        # Check all tables in public schema
        res = await session.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"))
        tables = [r[0] for r in res.fetchall()]
        print("Existing tables:", tables)

        # Check analyses
        res = await session.execute(select(Analysis))
        analyses = res.scalars().all()
        print(f"\nTotal Analyses: {len(analyses)}")
        for a in analyses:
            print(f"- ID: {a.id} | IdeaID: {a.idea_id} | Status: {a.status} | Title: {a.title} | Domain: {a.domain}")
            # Get scores
            s_res = await session.execute(select(AnalysisScore).where(AnalysisScore.analysis_id == a.id))
            scores = s_res.scalars().all()
            print(f"  Scores ({len(scores)}):", {s.metric_name: s.score for s in scores})
            
            # Get findings
            f_res = await session.execute(select(Finding).where(Finding.analysis_id == a.id))
            findings = f_res.scalars().all()
            print(f"  Findings ({len(findings)}):", [f.title for f in findings[:3]])

            # Get evidence count
            e_res = await session.execute(text("SELECT count(*) FROM evidence WHERE analysis_id = :aid"), {"aid": a.id})
            ev_count = e_res.scalar()
            print(f"  Evidence count: {ev_count}")

        # Check Idea table from Prisma
        try:
            res = await session.execute(text("SELECT id, title, status, industry, \"userId\", \"overallViability\", \"noveltyScore\", \"marketDemand\" FROM \"Idea\""))
            ideas = res.fetchall()
            print(f"\nTotal Ideas in Idea table: {len(ideas)}")
            for i in ideas:
                print(f"- ID: {i[0]} | Title: {i[1]} | Status: {i[2]} | UserID: {i[4]} | Viability: {i[5]}")
        except Exception as e:
            print(f"\nError querying Idea table: {e}")

        # Check ComparisonReport table
        try:
            res = await session.execute(text("SELECT count(*) FROM \"ComparisonReport\""))
            cr_count = res.scalar()
            print(f"\nTotal ComparisonReports in table: {cr_count}")
        except Exception as e:
            print(f"\nComparisonReport table check: {e}")

if __name__ == "__main__":
    asyncio.run(main())
