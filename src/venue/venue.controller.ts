import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
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

    @Get('id')
    getVenueById(@Param('id', ParseIntPipe) venueId:number ){
        return this.venueService.getVenueById(venueId)

    }

    @Patch()
    editVenue(@GetVenue('id') venueId: number,@Body() dto:EditVenueDto){
        return this.venueService.editVenue(venueId,dto)
    }


}
