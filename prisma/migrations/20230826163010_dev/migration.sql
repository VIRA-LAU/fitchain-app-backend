/*
  Warnings:

  - You are about to drop the column `awayUpdatedPoints` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `homeUpdatedPoints` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "awayUpdatedPoints",
DROP COLUMN "homeUpdatedPoints",
ADD COLUMN     "updatedAwayPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedHomePoints" INTEGER NOT NULL DEFAULT 0;
