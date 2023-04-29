import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from '../auth/gaurd';
import { TimeslotsService } from './timeslots.service';
import { SocketGateway } from 'src/socket.gateway';
import { CreateTimeslotsDto, DeleteTimeSlotDto } from './dto';

@UseGuards(JwtGaurd)
@Controller('timeslots')
export class TimeslotsController {
    constructor(private timeslotsService: TimeslotsService){}

    @Get()
    get(@GetUser('id') userId: number, @Query('courtId', ParseIntPipe) courtId: number, @Query('venueId', ParseIntPipe) venueId: number) {
        return this.timeslotsService.getTimeSlots(courtId, venueId);
    }

    @Post() 
    createTimeSlot(@GetUser('id') userId: number, @Body() dto: CreateTimeslotsDto) {
        return this.timeslotsService.addCourtTimeSlot(dto);
    }
    
    @Delete()
    deleteTimeSlot(@GetUser('id') userId: number, @Body() dto: DeleteTimeSlotDto) {
        return this.timeslotsService.deleteTimeSlot(dto);
    }
}
