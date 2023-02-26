import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from '../auth/gaurd';
import { createBookingDto } from './dto/create-booking.dto';
import { editBookingDto } from './dto/edit-booking.dto';
import { GameService } from './game.service';

@UseGuards(JwtGaurd)
@Controller('games')
export class GameController {
    constructor(private gameService: GameService){}

    @Get('bookings')
    getBookings(){
        return this.gameService.getBookings()
    }

    @Get('bookings/:id')
    getBookingById(@GetUser('id') userId: number,  @Param('id', ParseIntPipe) bookingId:number ){
        return this.gameService.getBookingById(userId, bookingId)
    }

    @Get('upcoming')
    getUpcoming(@GetUser('id') userId: number) {
        return this.gameService.getUpcomingGames(userId);
    }
    @Post("bookings")
    createBooking(@GetUser('id') userId:number, @Body() dto:createBookingDto){
        console.log("create booking")
        return this.gameService.createBooking(userId,dto)
    }

    @Patch('bookings/:id')
    editBookingById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookingId: number,@Body() dto:editBookingDto){
        return this.gameService.editBookingById(userId,bookingId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('bookings/:id')
    deleteBookingById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) bookingId:number){
        return this.gameService.deleteBookingById(userId,bookingId)
        
    }


}
