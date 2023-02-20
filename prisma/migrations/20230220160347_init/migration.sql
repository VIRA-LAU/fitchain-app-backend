-- CreateEnum
CREATE TYPE "invitationApproval" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "gameStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "gameType" AS ENUM ('Basketball', 'Football', 'Tennis');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "hash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "age" INTEGER,
    "nationality" TEXT,
    "position" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "managerEmail" TEXT NOT NULL,
    "managerPhoneNumber" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "managerFirstName" TEXT,
    "managerLastName" TEXT,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT NOT NULL,
    "venueId" INTEGER NOT NULL,
    "photoDirectoryURL" TEXT,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courtId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" "gameType" NOT NULL DEFAULT 'Basketball',
    "winnerTeam" TEXT,
    "highlights" TEXT[],
    "status" "gameStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "RequestToJoin" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "status" "invitationApproval" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "RequestToJoin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasStatistics" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_hash_key" ON "User"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_managerEmail_key" ON "Venue"("managerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_managerPhoneNumber_key" ON "Venue"("managerPhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Venue_hash_key" ON "Venue"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "InviteToGame_userId_friendId_gameId_key" ON "InviteToGame"("userId", "friendId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "AddFriend_userId_friendId_key" ON "AddFriend"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestToJoin_userId_gameId_key" ON "RequestToJoin"("userId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "HasStatistics_userId_gameId_key" ON "HasStatistics"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "RequestToJoin" ADD CONSTRAINT "RequestToJoin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestToJoin" ADD CONSTRAINT "RequestToJoin_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasStatistics" ADD CONSTRAINT "HasStatistics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasStatistics" ADD CONSTRAINT "HasStatistics_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
