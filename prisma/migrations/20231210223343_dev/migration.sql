-- AlterTable
ALTER TABLE "StatisticsGamePlayer" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "StatisticsGamePlayer" ADD CONSTRAINT "StatisticsGamePlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
