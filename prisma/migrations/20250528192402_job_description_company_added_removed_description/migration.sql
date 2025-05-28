/*
  Warnings:

  - The `interviewType` column on the `InterviewSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `InterviewSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `description` on the `JobDescription` table. All the data in the column will be lost.
  - Changed the type of `difficulty` on the `InterviewSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('STARTED', 'COMPLETED', 'ABANDONED');

-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "interviewType",
ADD COLUMN     "interviewType" "InterviewType" NOT NULL DEFAULT 'TECHNICAL',
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "InterviewStatus" NOT NULL DEFAULT 'STARTED';

-- AlterTable
ALTER TABLE "JobDescription" DROP COLUMN "description",
ADD COLUMN     "company" TEXT;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "type",
ADD COLUMN     "type" "InterviewType" NOT NULL;
