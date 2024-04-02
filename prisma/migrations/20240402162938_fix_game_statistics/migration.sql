/*
  Warnings:

  - The values [PENDING,APPROVED,REJECTED,ACTIVE,FINISHED] on the enum `GameStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameStatus_new" AS ENUM ('PAYMENTPENDING', 'PAYMENTREJECTED', 'UPCOMING', 'COMPLETE', 'CANCELLED', 'RESULTSPENDING', 'RESULTSPROCESSED');
ALTER TABLE "Game" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Game" ALTER COLUMN "status" TYPE "GameStatus_new" USING ("status"::text::"GameStatus_new");
ALTER TYPE "GameStatus" RENAME TO "GameStatus_old";
ALTER TYPE "GameStatus_new" RENAME TO "GameStatus";
DROP TYPE "GameStatus_old";
ALTER TABLE "Game" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
