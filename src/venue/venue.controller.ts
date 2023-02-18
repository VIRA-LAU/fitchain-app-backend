import { Controller, Get } from '@nestjs/common';
import { VenueService } from './venue.service';

@Controller('venues')
export class VenueController {
    constructor(private venueService: VenueService){}

    @Get()
    getVenues(){
        return this.venueService.getVenues()
    }
}
