import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { JwtGaurd } from '../auth/gaurd';
import { TimeslotsService } from './timeslots.service';
import { CreateTimeslotsDto, DeleteTimeSlotDto } from './dto';

@UseGuards(JwtGaurd)
@Controller('timeslots')
export class TimeslotsController {
    constructor(private timeslotsService: TimeslotsService){}

    @Get()
    getTimeSlots() {
        return this.timeslotsService.getTimeSlots();
    }

    @Get("branch/:id")
    getTimeSlotsInBranch(@Param('id', ParseIntPipe) branchId:number) {
        return this.timeslotsService.getTimeSlotsInBranch(branchId);
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
