/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "invitationApproval" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "height" INTEGER,
    "weight" INTEGER,
    "age" INTEGER,
    "nationality" TEXT,
    "position" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courtId" INTEGER NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "winnerTeam" INTEGER NOT NULL,
    "highlights" TEXT[],

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreateGame" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "status" "invitationApproval" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "CreateGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitesFriend" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "status" "invitationApproval" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "InvitesFriend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddsFriend" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "status" "invitationApproval" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "AddsFriend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestToJoin" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "status" "invitationApproval" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "RequestToJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasStatistics" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,

    CONSTRAINT "HasStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courtType" TEXT NOT NULL,
    "nbOfPlayers" INTEGER NOT NULL,
    "branchId" INTEGER NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "venueId" INTEGER NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "managerfirstName" TEXT,
    "managerLastName" TEXT,
    "managerEmail" TEXT NOT NULL,
    "managerPhoneNumber" INTEGER NOT NULL,
    "photoDirectoryURL" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Player_phoneNumber_key" ON "Player"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CreateGame_playerId_gameId_key" ON "CreateGame"("playerId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitesFriend_playerId_friendId_gameId_key" ON "InvitesFriend"("playerId", "friendId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "AddsFriend_playerId_friendId_key" ON "AddsFriend"("playerId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestToJoin_playerId_gameId_key" ON "RequestToJoin"("playerId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "HasStatistics_playerId_gameId_key" ON "HasStatistics"("playerId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_managerEmail_key" ON "Venue"("managerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_managerPhoneNumber_key" ON "Venue"("managerPhoneNumber");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateGame" ADD CONSTRAINT "CreateGame_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreateGame" ADD CONSTRAINT "CreateGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitesFriend" ADD CONSTRAINT "InvitesFriend_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitesFriend" ADD CONSTRAINT "InvitesFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitesFriend" ADD CONSTRAINT "InvitesFriend_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddsFriend" ADD CONSTRAINT "AddsFriend_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddsFriend" ADD CONSTRAINT "AddsFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestToJoin" ADD CONSTRAINT "RequestToJoin_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestToJoin" ADD CONSTRAINT "RequestToJoin_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasStatistics" ADD CONSTRAINT "HasStatistics_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasStatistics" ADD CONSTRAINT "HasStatistics_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
