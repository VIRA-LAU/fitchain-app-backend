import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGaurd } from '../auth/gaurd';
import { TimeslotsService } from './timeslots.service';
import { CreateTimeslotsDto, DeleteTimeSlotDto } from './dto';

@UseGuards(JwtGaurd)
@Controller('timeslots')
export class TimeslotsController {
    constructor(private timeslotsService: TimeslotsService){}

    @Get()
    getTimeSlot(@Query('courtId') courtId?: string, @Query('branchId') branchId?: string) {
        return this.timeslotsService.getTimeSlots(parseInt(courtId), parseInt(branchId));
    }

    @Post() 
    createTimeSlot(@Body() dto: CreateTimeslotsDto) {
        return this.timeslotsService.addCourtTimeSlot(dto);
    }

    @Delete()
    deleteTimeSlot(@Body() dto: DeleteTimeSlotDto) {
        return this.timeslotsService.deleteTimeSlot(dto);
    }
}
