-- CreateEnum
CREATE TYPE "StatisticsGameStatus" AS ENUM ('PENDING', 'INPROGRESS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "CourtType" AS ENUM ('HalfCourt', 'FullCourt');

-- CreateTable
CREATE TABLE "StatisticsGame" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "GameType" NOT NULL DEFAULT 'Basketball',
    "courtType" "CourtType" NOT NULL DEFAULT 'FullCourt',
    "status" "StatisticsGameStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "StatisticsGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatisticsGamePlayer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "gameNumber" INTEGER NOT NULL DEFAULT 1,
    "twoPointsMade" INTEGER NOT NULL DEFAULT 0,
    "twoPointsMissed" INTEGER NOT NULL DEFAULT 0,
    "threePointsMade" INTEGER NOT NULL DEFAULT 0,
    "threePointsMissed" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "blocks" INTEGER NOT NULL DEFAULT 0,
    "rebounds" INTEGER NOT NULL DEFAULT 0,
    "steals" INTEGER NOT NULL DEFAULT 0,
    "type" "GameType" NOT NULL DEFAULT 'Basketball',
    "courtType" "CourtType" NOT NULL DEFAULT 'FullCourt',
    "status" "StatisticsGameStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "StatisticsGamePlayer_pkey" PRIMARY KEY ("id")
);
