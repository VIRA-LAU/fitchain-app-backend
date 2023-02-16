/*
  Warnings:

  - You are about to drop the `AddsFriend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvitesFriend` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddsFriend" DROP CONSTRAINT "AddsFriend_friendId_fkey";

-- DropForeignKey
ALTER TABLE "AddsFriend" DROP CONSTRAINT "AddsFriend_userId_fkey";

-- DropForeignKey
ALTER TABLE "InvitesFriend" DROP CONSTRAINT "InvitesFriend_friendId_fkey";

-- DropForeignKey
ALTER TABLE "InvitesFriend" DROP CONSTRAINT "InvitesFriend_gameId_fkey";

-- DropForeignKey
ALTER TABLE "InvitesFriend" DROP CONSTRAINT "InvitesFriend_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- DropTable
DROP TABLE "AddsFriend";

-- DropTable
DROP TABLE "InvitesFriend";

-- CreateTable
CREATE TABLE "InviteToGame" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "status" "invitationApproval" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "InviteToGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddFriend" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "status" "invitationApproval" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "AddFriend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteToGame_userId_friendId_gameId_key" ON "InviteToGame"("userId", "friendId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "AddFriend_userId_friendId_key" ON "AddFriend"("userId", "friendId");

-- AddForeignKey
ALTER TABLE "InviteToGame" ADD CONSTRAINT "InviteToGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteToGame" ADD CONSTRAINT "InviteToGame_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteToGame" ADD CONSTRAINT "InviteToGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddFriend" ADD CONSTRAINT "AddFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddFriend" ADD CONSTRAINT "AddFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
