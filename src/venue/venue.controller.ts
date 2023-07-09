import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { VenueService } from './venue.service';
import { JwtGaurd } from 'src/auth/gaurd';

@UseGuards(JwtGaurd)
@Controller('venues')
export class VenueController {
  constructor(private venueService: VenueService) {}

  @Get()
  getVenues() {
    return this.venueService.getVenues();
  }

  @Get(':id')
  getVenueById(@Param('id', ParseIntPipe) venueId: number) {
    return this.venueService.getVenueById(venueId);
  }
}
