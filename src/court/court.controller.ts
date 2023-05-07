import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator/get-user.decorator'
import { CourtService } from './court.service';
import { CreateCourtDto, EditCourtDto } from './dto';
import { JwtGaurd } from 'src/auth/gaurd';

@UseGuards(JwtGaurd)
@Controller('courts')
export class CourtController {
    constructor(private courtService: CourtService){}

    @Get()
    getCourts(@Query('branchId') branchId?: string, @Query('venueId') venueId?: string){
        return this.courtService.getCourts(parseInt(branchId), parseInt(venueId))
    }

    @Get(':id')
    getCourtById(@Param('id', ParseIntPipe) courtId: number ){
        return this.courtService.getCourtById(courtId)
    }

    @Post()
    createCourt(@GetUser('id') branchId: number, @Body() dto:CreateCourtDto){
        return this.courtService.createCourt(branchId, dto)
    }

    @Patch(':id')
    editCourtById(@GetUser('id') branchId: number, @Param('id', ParseIntPipe) courtId: number, @Body() dto: EditCourtDto){
        return this.courtService.editCourtById(courtId, dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteCourtById(@GetUser('id') branchId:number, @Param('id', ParseIntPipe) courtId: number){
        return this.courtService.deleteCourtById(branchId,courtId)
        
    }

}
