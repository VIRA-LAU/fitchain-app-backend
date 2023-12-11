import { Module } from '@nestjs/common';
import { StatisticsGameService } from './statistics-game.service';
import { StatisticsGameController } from './statistics-game.controller';

@Module({
  providers: [StatisticsGameService],
  exports: [StatisticsGameService],
  controllers: [StatisticsGameController],
})
export class StatisticsGameModule {}
