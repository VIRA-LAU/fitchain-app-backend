/*
  Warnings:

  - The `status` column on the `AddFriend` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `awayScore` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `homeScore` on the `Game` table. All the data in the column will be lost.
  - The `type` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `adminTeam` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `team` column on the `InviteToGame` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `InviteToGame` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `team` column on the `RequestToJoinGame` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `RequestToJoinGame` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `HasStatistics` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InvitationApproval" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CANCELLED', 'FINISHED');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('Basketball', 'Football', 'Tennis');

-- CreateEnum
CREATE TYPE "TeamType" AS ENUM ('HOME', 'AWAY');

-- DropForeignKey
ALTER TABLE "HasStatistics" DROP CONSTRAINT "HasStatistics_gameId_fkey";

-- DropForeignKey
ALTER TABLE "HasStatistics" DROP CONSTRAINT "HasStatistics_userId_fkey";

-- AlterTable
ALTER TABLE "AddFriend" DROP COLUMN "status",
ADD COLUMN     "status" "InvitationApproval" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "awayScore",
DROP COLUMN "homeScore",
ADD COLUMN     "awayPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "awayPossession" TEXT NOT NULL DEFAULT '0%',
ADD COLUMN     "awayUpdatedPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "homePoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "homePossession" TEXT NOT NULL DEFAULT '0%',
ADD COLUMN     "homeUpdatedPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "videoPath" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "GameType" NOT NULL DEFAULT 'Basketball',
DROP COLUMN "adminTeam",
ADD COLUMN     "adminTeam" "TeamType" NOT NULL DEFAULT 'HOME',
DROP COLUMN "status",
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "InviteToGame" DROP COLUMN "team",
ADD COLUMN     "team" "TeamType" NOT NULL DEFAULT 'HOME',
DROP COLUMN "status",
ADD COLUMN     "status" "InvitationApproval" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "RequestToJoinGame" DROP COLUMN "team",
ADD COLUMN     "team" "TeamType" NOT NULL DEFAULT 'HOME',
DROP COLUMN "status",
ADD COLUMN     "status" "InvitationApproval" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "HasStatistics";

-- DropEnum
DROP TYPE "gameStatus";

-- DropEnum
DROP TYPE "gameType";

-- DropEnum
DROP TYPE "invitationApproval";

-- DropEnum
DROP TYPE "teamType";

-- DropEnum
DROP TYPE "winnerTeamType";

-- CreateTable
CREATE TABLE "PlayerStatistics" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "scored" INTEGER NOT NULL DEFAULT 0,
    "missed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlayerStatistics_userId_gameId_key" ON "PlayerStatistics"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "PlayerStatistics" ADD CONSTRAINT "PlayerStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerStatistics" ADD CONSTRAINT "PlayerStatistics_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
