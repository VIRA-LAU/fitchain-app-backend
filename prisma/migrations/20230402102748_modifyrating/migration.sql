/*
  Warnings:

  - You are about to drop the column `rating` on the `PlayerRating` table. All the data in the column will be lost.
  - Added the required column `fairplay` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `performance` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `punctuality` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamPlayer` to the `PlayerRating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PlayerRating" DROP COLUMN "rating",
ADD COLUMN     "fairplay" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "performance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "punctuality" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "teamPlayer" DOUBLE PRECISION NOT NULL;
