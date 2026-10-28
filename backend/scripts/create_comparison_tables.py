import asyncio
from backend.core.database import async_session_factory
from sqlalchemy import text

STATEMENTS = [
    """CREATE TABLE IF NOT EXISTS "ComparisonReport" (
        "id" TEXT NOT NULL,
        "reportNumber" SERIAL NOT NULL,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "objective" TEXT NOT NULL DEFAULT 'Choose the best opportunity for an MVP',
        "status" TEXT NOT NULL DEFAULT 'COMPLETED',
        "methodologyVersion" TEXT NOT NULL DEFAULT 'Multi-Vector Pareto Synthesis v3.4',
        "selectedWeights" TEXT,
        "recommendation" TEXT,
        "paretoFrontier" TEXT,
        "dataComparability" TEXT,
        "executiveTakeaway" TEXT,
        "candidatesCount" INTEGER NOT NULL DEFAULT 2,
        "durationMs" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedAt" TIMESTAMP(3),
        CONSTRAINT "ComparisonReport_pkey" PRIMARY KEY ("id")
    );""",
    """CREATE TABLE IF NOT EXISTS "ComparisonCandidate" (
        "id" TEXT NOT NULL,
        "comparisonId" TEXT NOT NULL,
        "ideaId" TEXT NOT NULL,
        "analysisId" TEXT NOT NULL,
        "candidatePosition" INTEGER NOT NULL,
        "ideaTitle" TEXT NOT NULL,
        "ideaDomain" TEXT,
        "ideaDescription" TEXT,
        "analysisScore" DOUBLE PRECISION,
        "scores" TEXT,
        "strengths" TEXT,
        "vulnerabilities" TEXT,
        "tradeoffs" TEXT,
        "sourcesCount" INTEGER NOT NULL DEFAULT 0,
        "analyzedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ComparisonCandidate_pkey" PRIMARY KEY ("id")
    );""",
    """CREATE INDEX IF NOT EXISTS "ComparisonReport_userId_createdAt_idx" ON "ComparisonReport"("userId", "createdAt");""",
    """CREATE INDEX IF NOT EXISTS "ComparisonReport_status_idx" ON "ComparisonReport"("status");""",
    """DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'ComparisonCandidate_comparisonId_ideaId_key'
        ) THEN
            ALTER TABLE "ComparisonCandidate" ADD CONSTRAINT "ComparisonCandidate_comparisonId_ideaId_key" UNIQUE ("comparisonId", "ideaId");
        END IF;
    END $$;""",
    """CREATE INDEX IF NOT EXISTS "ComparisonCandidate_comparisonId_candidatePosition_idx" ON "ComparisonCandidate"("comparisonId", "candidatePosition");""",
    """DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'ComparisonReport_userId_fkey'
        ) THEN
            ALTER TABLE "ComparisonReport" ADD CONSTRAINT "ComparisonReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END $$;""",
    """DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'ComparisonCandidate_comparisonId_fkey'
        ) THEN
            ALTER TABLE "ComparisonCandidate" ADD CONSTRAINT "ComparisonCandidate_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "ComparisonReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END $$;""",
    """DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'ComparisonCandidate_ideaId_fkey'
        ) THEN
            ALTER TABLE "ComparisonCandidate" ADD CONSTRAINT "ComparisonCandidate_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
    END $$;"""
]

async def main():
    async with async_session_factory() as session:
        print("Running DDL for ComparisonReport and ComparisonCandidate...")
        for stmt in STATEMENTS:
            await session.execute(text(stmt))
        await session.commit()
        print("ComparisonReport and ComparisonCandidate tables verified/created successfully!")


if __name__ == "__main__":
    asyncio.run(main())
