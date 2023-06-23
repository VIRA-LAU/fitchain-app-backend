/*
  Warnings:

  - You are about to drop the column `managerEmail` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `managerEmailCode` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `managerPhoneNumber` on the `Branch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Branch_managerEmail_key";

-- DropIndex
DROP INDEX "Branch_managerPhoneNumber_key";

-- AlterTable
ALTER TABLE "Branch"
RENAME COLUMN "managerEmail" TO "email";

ALTER TABLE "Branch"
RENAME COLUMN "managerEmailCode" TO "emailCode";

ALTER TABLE "Branch"
RENAME COLUMN "managerPhoneNumber" TO "phoneNumber";

-- CreateIndex
CREATE UNIQUE INDEX "Branch_email_key" ON "Branch"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_phoneNumber_key" ON "Branch"("phoneNumber");
