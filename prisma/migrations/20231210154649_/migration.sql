/*
  Warnings:

  - Added the required column `adminId` to the `StatisticsGame` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StatisticsGame" ADD COLUMN     "adminId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "StatisticsGame" ADD CONSTRAINT "StatisticsGame_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
