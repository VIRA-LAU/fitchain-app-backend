/*
  Warnings:

  - You are about to drop the `CourtTimeSlots` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courtId` to the `TimeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CourtTimeSlots" DROP CONSTRAINT "CourtTimeSlots_courtId_fkey";

-- DropForeignKey
ALTER TABLE "CourtTimeSlots" DROP CONSTRAINT "CourtTimeSlots_timeSlotId_fkey";

-- AlterTable
ALTER TABLE "TimeSlot" ADD COLUMN     "courtId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "CourtTimeSlots";

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
