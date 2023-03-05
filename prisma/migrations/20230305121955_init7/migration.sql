/*
  Warnings:

  - You are about to drop the `RequestToJoin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RequestToJoin" DROP CONSTRAINT "RequestToJoin_gameId_fkey";

-- DropForeignKey
ALTER TABLE "RequestToJoin" DROP CONSTRAINT "RequestToJoin_userId_fkey";

-- DropTable
DROP TABLE "RequestToJoin";

-- CreateTable
CREATE TABLE "RequestToJoinGame" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "team" "teamType" NOT NULL DEFAULT 'HOME',
    "status" "invitationApproval" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "RequestToJoinGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestToJoinGame_userId_gameId_key" ON "RequestToJoinGame"("userId", "gameId");

-- AddForeignKey
ALTER TABLE "RequestToJoinGame" ADD CONSTRAINT "RequestToJoinGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestToJoinGame" ADD CONSTRAINT "RequestToJoinGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
