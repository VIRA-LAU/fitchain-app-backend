/*
  Warnings:

  - You are about to drop the column `photoDirectoryUrl` on the `Branch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "photoDirectoryUrl",
ADD COLUMN     "branchPhotoUrl" TEXT;
