/*
  Warnings:

  - A unique constraint covering the columns `[processedId,gameId]` on the table `PlayerStatistics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PlayerStatistics_userId_gameId_key";

-- AlterTable
ALTER TABLE "PlayerStatistics" ADD COLUMN     "processedId" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStatistics_processedId_gameId_key" ON "PlayerStatistics"("processedId", "gameId");
