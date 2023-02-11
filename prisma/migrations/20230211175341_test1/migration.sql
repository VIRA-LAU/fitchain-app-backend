/*
  Warnings:

  - You are about to drop the column `gameDate` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the `CreateGame` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `adminId` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "gameStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PENDING');

-- DropForeignKey
ALTER TABLE "CreateGame" DROP CONSTRAINT "CreateGame_gameId_fkey";

-- DropForeignKey
ALTER TABLE "CreateGame" DROP CONSTRAINT "CreateGame_playerId_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "gameDate",
ADD COLUMN     "adminId" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "gameStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "winnerTeam" DROP NOT NULL,
ALTER COLUMN "winnerTeam" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Venue" ALTER COLUMN "managerPhoneNumber" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "CreateGame";

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
