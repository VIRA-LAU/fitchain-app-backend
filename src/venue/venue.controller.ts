import { Controller, Get } from '@nestjs/common';
import { GetVenues } from 'src/auth/decorator';
import { VenueService } from './venue.service';

@Controller('venues')
export class VenueController {
    constructor(private venueService: VenueService){}

    @Get()
    getVenues(){
        return this.venueService.getVenues()
    }
}
