-- CreateEnum
CREATE TYPE "HireRecommendation" AS ENUM ('STRONGLY_RECOMMEND', 'RECOMMEND', 'NEUTRAL', 'DO_NOT_RECOMMEND');

-- CreateTable
CREATE TABLE "InterviewFeedback" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overallScore" INTEGER,
    "feedback" TEXT NOT NULL,
    "hireRecommendation" "HireRecommendation" NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "improvementAreas" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewFeedback_sessionId_key" ON "InterviewFeedback"("sessionId");

-- AddForeignKey
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
