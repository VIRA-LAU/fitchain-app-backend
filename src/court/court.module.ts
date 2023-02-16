import { Module } from '@nestjs/common';
import { CourtController } from './court.controller';
import { CourtService } from './court.service';

@Module({
  controllers: [CourtController],
  providers: [CourtService]
})
export class CourtModule {}
