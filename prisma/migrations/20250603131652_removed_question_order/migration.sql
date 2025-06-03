/*
  Warnings:

  - You are about to drop the column `order` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `triggerResponse` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "order",
DROP COLUMN "triggerResponse";
