import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtGaurd } from '../auth/gaurd';
import { TimeslotsService } from './timeslots.service';

@UseGuards(JwtGaurd)
@Controller('timeslots')
export class TimeslotsController {
  constructor(private timeslotsService: TimeslotsService) {}

  @Get()
  getTimeSlots() {
    return this.timeslotsService.getTimeSlots();
  }

  @Get('branch/:id')
  getTimeSlotsInBranch(@Param('id', ParseIntPipe) branchId: number) {
    return this.timeslotsService.getTimeSlotsInBranch(branchId);
  }
}
