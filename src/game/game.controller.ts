import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGaurd } from 'src/auth/gaurd';
import { createBookingDto } from './dto/create-booking.dto';
import { editBookingDto } from './dto/edit-booking.dto';
import { GameService } from './game.service';

@UseGuards(JwtGaurd)
@Controller('games')
export class GameController {
    constructor(private gameService: GameService){}

    @Get('bookings')
    getBookings(@GetUser('id') userId: number ){
        return this.gameService.getBookings(userId)
    }

    @Get(':id')
    getBookingById(@GetUser('id') userId: number,  @Param('id', ParseIntPipe) bookingId:number ){
        return this.gameService.getBookingById(userId, bookingId)
    }

    @Post()
    createBookmark(@GetUser('id') userId:number, @Body() dto:createBookingDto){
        return this.gameService.createBooking(userId,dto)
    }

    @Patch(':id')
    editBookmarkById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookmarkId: number,@Body() dto:editBookingDto){
        return this.gameService.editBookingById(userId,bookmarkId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookmarkId:number){
        return this.gameService.deleteBookingById(userId,bookmarkId)
        
    }


}
