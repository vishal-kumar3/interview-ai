/*
  Warnings:

  - The `aiPromptContext` column on the `SessionMetadata` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SessionMetadata" DROP COLUMN "aiPromptContext",
ADD COLUMN     "aiPromptContext" JSONB[];
