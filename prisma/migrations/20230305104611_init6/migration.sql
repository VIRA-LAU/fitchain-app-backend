/*
  Warnings:

  - The `winnerTeam` column on the `Game` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "teamType" AS ENUM ('HOME', 'AWAY');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "adminTeam" "teamType" NOT NULL DEFAULT 'HOME',
DROP COLUMN "winnerTeam",
ADD COLUMN     "winnerTeam" "teamType" NOT NULL DEFAULT 'HOME';

-- AlterTable
ALTER TABLE "InviteToGame" ADD COLUMN     "team" "teamType" NOT NULL DEFAULT 'HOME';

-- AlterTable
ALTER TABLE "RequestToJoin" ADD COLUMN     "team" "teamType" NOT NULL DEFAULT 'HOME';
