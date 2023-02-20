-- CreateEnum
CREATE TYPE "gameType" AS ENUM ('BASKETBALL', 'FOOTBALL', 'TENNIS');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "type" "gameType" NOT NULL DEFAULT 'BASKETBALL';
