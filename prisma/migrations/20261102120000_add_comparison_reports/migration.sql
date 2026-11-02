-- CreateTable
CREATE TABLE "ComparisonReport" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ComparisonReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComparisonCandidate" (
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
);

-- CreateIndex
CREATE INDEX "ComparisonReport_userId_createdAt_idx" ON "ComparisonReport"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ComparisonReport_status_idx" ON "ComparisonReport"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ComparisonCandidate_comparisonId_ideaId_key" ON "ComparisonCandidate"("comparisonId", "ideaId");

-- CreateIndex
CREATE INDEX "ComparisonCandidate_comparisonId_candidatePosition_idx" ON "ComparisonCandidate"("comparisonId", "candidatePosition");

-- AddForeignKey
ALTER TABLE "ComparisonReport" ADD CONSTRAINT "ComparisonReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonCandidate" ADD CONSTRAINT "ComparisonCandidate_comparisonId_fkey" FOREIGN KEY ("comparisonId") REFERENCES "ComparisonReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComparisonCandidate" ADD CONSTRAINT "ComparisonCandidate_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
