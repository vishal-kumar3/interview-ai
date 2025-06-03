/*
  Warnings:

  - Added the required column `title` to the `InterviewSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterviewSession" ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "aiContext" JSONB,
ADD COLUMN     "difficulty" "Difficulty",
ADD COLUMN     "followUpDepth" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "triggerResponse" TEXT;

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "confidence" DOUBLE PRECISION,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "keyPoints" JSONB;

-- CreateTable
CREATE TABLE "SessionMetadata" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "aiPromptContext" JSONB NOT NULL,
    "focusAreas" TEXT[],
    "avoidTopics" TEXT[],
    "customSettings" JSONB,
    "conversationFlow" JSONB,

    CONSTRAINT "SessionMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionMetadata_sessionId_key" ON "SessionMetadata"("sessionId");

-- AddForeignKey
ALTER TABLE "SessionMetadata" ADD CONSTRAINT "SessionMetadata_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
