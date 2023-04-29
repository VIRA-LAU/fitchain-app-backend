import { Module } from '@nestjs/common';
import { TimeslotsService } from './timeslots.service';
import { TimeslotsController } from './timeslots.controller';

@Module({
  providers: [TimeslotsService],
  controllers: [TimeslotsController]
})
export class TimeslotsModule {}
