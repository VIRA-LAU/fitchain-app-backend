/*
  Warnings:

  - You are about to drop the column `emailCode` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `emailCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "emailCode";

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "homeScore" DROP DEFAULT,
ALTER COLUMN "awayScore" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailCode";
