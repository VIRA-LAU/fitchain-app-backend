/*
  Warnings:

  - The values [BASKETBALL,FOOTBALL,TENNIS] on the enum `gameType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "gameType_new" AS ENUM ('Basketball', 'Football', 'Tennis');
ALTER TABLE "Game" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Game" ALTER COLUMN "type" TYPE "gameType_new" USING ("type"::text::"gameType_new");
ALTER TYPE "gameType" RENAME TO "gameType_old";
ALTER TYPE "gameType_new" RENAME TO "gameType";
DROP TYPE "gameType_old";
ALTER TABLE "Game" ALTER COLUMN "type" SET DEFAULT 'Basketball';
COMMIT;

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "type" SET DEFAULT 'Basketball';
