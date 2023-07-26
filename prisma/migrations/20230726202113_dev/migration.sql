/*
  Warnings:

  - A unique constraint covering the columns `[userId,friendId,gameId,status]` on the table `InviteToGame` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,gameId,status]` on the table `RequestToJoinGame` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "InviteToGame_userId_friendId_gameId_key";

-- DropIndex
DROP INDEX "RequestToJoinGame_userId_gameId_key";

-- CreateIndex
CREATE UNIQUE INDEX "InviteToGame_userId_friendId_gameId_status_key" ON "InviteToGame"("userId", "friendId", "gameId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RequestToJoinGame_userId_gameId_status_key" ON "RequestToJoinGame"("userId", "gameId", "status");
