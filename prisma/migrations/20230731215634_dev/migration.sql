/*
  Warnings:

  - You are about to drop the `GameTimeSlots` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameTimeSlots" DROP CONSTRAINT "GameTimeSlots_gameId_fkey";

-- DropForeignKey
ALTER TABLE "GameTimeSlots" DROP CONSTRAINT "GameTimeSlots_timeSlotId_fkey";

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "endTime" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "startTime" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "GameTimeSlots";
