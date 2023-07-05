/*
  Warnings:

  - You are about to drop the column `photoDirectoryURL` on the `Branch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "photoDirectoryURL",
ADD COLUMN     "coverPhotoUrl" TEXT,
ADD COLUMN     "photoDirectoryUrl" TEXT;
