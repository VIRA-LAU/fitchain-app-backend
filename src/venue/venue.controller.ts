import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { EditVenueDto } from './dto';
import { VenueService } from './venue.service';

@Controller('venues')
export class VenueController {
    constructor(private venueService: VenueService){}

    @Get()
    getVenues(){
        return this.venueService.getVenues()
    }

    @Get(':id')
    getVenueById(@Param('id', ParseIntPipe) venueId:number){
        return this.venueService.getVenueById(venueId)
    }

    // @Patch()
    // editVenue(@GetUser('id') venueId: number,@Body() dto:EditVenueDto){
    //     return this.venueService.editVenue(venueId,dto)
    // }
}
