/*
  Warnings:

  - Added the required column `defense` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `general` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offense` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamplay` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerRating" ADD COLUMN     "defense" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "general" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "offense" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "skill" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "teamplay" DOUBLE PRECISION NOT NULL;
