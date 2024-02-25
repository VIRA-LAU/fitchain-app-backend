/*
  Warnings:

  - You are about to drop the `StatisticsGame` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StatisticsGamePlayer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `isBooked` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StatisticsGame" DROP CONSTRAINT "StatisticsGame_adminId_fkey";

-- DropForeignKey
ALTER TABLE "StatisticsGamePlayer" DROP CONSTRAINT "StatisticsGamePlayer_statisticsGameId_fkey";

-- DropForeignKey
ALTER TABLE "StatisticsGamePlayer" DROP CONSTRAINT "StatisticsGamePlayer_userId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "isBooked" BOOLEAN NOT NULL,
ALTER COLUMN "courtId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PlayerStatistics" ADD COLUMN     "assists" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "blocks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gameNumber" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rebounds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "steals" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "threePointsMade" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "threePointsMissed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twoPointsMade" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "twoPointsMissed" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "StatisticsGame";

-- DropTable
DROP TABLE "StatisticsGamePlayer";
