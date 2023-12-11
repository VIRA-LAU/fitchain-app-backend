/*
  Warnings:

  - You are about to drop the column `courtType` on the `StatisticsGamePlayer` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `StatisticsGamePlayer` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `StatisticsGamePlayer` table. All the data in the column will be lost.
  - Added the required column `statisticsGameId` to the `StatisticsGamePlayer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StatisticsGamePlayer" DROP COLUMN "courtType",
DROP COLUMN "status",
DROP COLUMN "type",
ADD COLUMN     "statisticsGameId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "StatisticsGamePlayer" ADD CONSTRAINT "StatisticsGamePlayer_statisticsGameId_fkey" FOREIGN KEY ("statisticsGameId") REFERENCES "StatisticsGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
