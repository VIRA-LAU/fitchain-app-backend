import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from '../auth/gaurd';
import { createBookingDto } from './dto/create-booking.dto';
import { createFollowGameDto } from './dto/create-follow-game.dto';
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
    getBookingById(@Param('id', ParseIntPipe) bookingId:number ){
        return this.gameService.getBookingById(bookingId)
    }

    @Get('playerstatus/:gameId')
    getPlayerGameStatus(@GetUser('id') userId: number, @Param('gameId', ParseIntPipe) gameId: number){
        return this.gameService.getPlayerGameStatus(userId, gameId)
    }

    @Get('followed')
    getFollowedGames(@GetUser('id') userId: number){
        return this.gameService.getFollowedGames(userId)
    }

    @Post("followed")
    createFollowGame(@GetUser('id') userId:number, @Body() dto:createFollowGameDto){
        console.log("create follow")
        return this.gameService.createFollowGame(userId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete('followed')
    deleteFollowById(@GetUser('id') userId:number, @Query('gameId') gameId:string){
        return this.gameService.deleteFollowById(userId,parseInt(gameId))
        
    }

    @Get('updates/:id')
    getUpdates(@Param('id', ParseIntPipe) gameId:number) {
        return this.gameService.getUpdates(gameId);
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

    @Get('upcomings')
    getUpcomings(@GetUser('id') userId: number) {
        return this.gameService.getUpcomings(userId);
    }

    @Get('upcomings/:id')
    getUpcomingById(@GetUser('id') userId: number,  @Param('id', ParseIntPipe) upcomingId:number ){
        return this.gameService.getUpcomingById(userId, upcomingId)
    }

    @Get('activities')
    getActivities(@GetUser('id') userId: number) {
        return this.gameService.getActivities(userId);
    }



}
