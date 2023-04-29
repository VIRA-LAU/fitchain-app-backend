import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { GetVenue } from '../auth/decorator';
import { EditVenueDto } from './dto';
import { VenueService } from './venue.service';

@Controller('venues')
export class VenueController {
    constructor(private venueService: VenueService){}

    @Get()
    getVenues(){
        return this.venueService.getVenues()
    }

    @Get("bookings/:id")
    getBookingsInVenue(@Param('id', ParseIntPipe) venueId:number, @Query('date') date: string) {
        return this.venueService.getBookingsInVenue(venueId, new Date(date))
    }
    
    @Get("timeSlots/:id")
    getTimeSlotsInVenue(@Param('id', ParseIntPipe) venueId:number) {
        return this.venueService.getTimeSlotsInVenue(venueId)
    }

    @Get(':id')
    getVenueById(@Param('id', ParseIntPipe) venueId:number){
        return this.venueService.getVenueById(venueId)
    }

    @Patch()
    editVenue(@GetVenue('id') venueId: number,@Body() dto:EditVenueDto){
        return this.venueService.editVenue(venueId,dto)
    }
}
