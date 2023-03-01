import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { GetVenue } from '../auth/decorator/get-venue.decorator';
import { CourtService } from './court.service';
import { CreateCourtDto, EditCourtDto } from './dto';

@Controller('courts')
export class CourtController {
    constructor(private courtService: CourtService){}

    @Get()
    getCourts(){
        return this.courtService.getCourts()

    }

    @Get(':id')
    getCourtById(@Param('id', ParseIntPipe) courtId:number ){
        return this.courtService.getCourtById(courtId)

    }

    @Post()
    createCourt(@GetVenue('id') venueId:number, @Body() dto:CreateCourtDto){
        return this.courtService.createCourt(dto)
    }

    @Patch(':id')
    editCourtById(@GetVenue('id') venueId:number, @Param('id', ParseIntPipe) courtId: number,@Body() dto:EditCourtDto){
        return this.courtService.editCourtById(venueId,courtId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteCourtById(@GetVenue('id') venueId:number, @Param('id', ParseIntPipe) courtId:number){
        return this.courtService.deleteCourtById(venueId,courtId)
        
    }

}
