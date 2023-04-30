import { Body, Controller, Post } from '@nestjs/common';
import { MapsService } from './maps.service';
import { CoordinatesDto,  } from './dto';

@Controller('maps')
export class MapsController {
    constructor(private mapsService: MapsService){}

    @Post("location-name")
    getLocationName(@Body() dto: CoordinatesDto) {
        return this.mapsService.getLocationName(dto.latitude, dto.longitude);
    }
    
    @Post("distance")
    getDistance(@Body() dto: CoordinatesDto) {
        return this.mapsService.getDistanceFromLocation(dto.latitude, dto.longitude, dto.locations);
    }
}
