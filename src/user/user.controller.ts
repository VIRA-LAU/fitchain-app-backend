import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGaurd } from '../auth/gaurd';
import { EditUserDto } from './dto/edit-user.dto';
import { ratePlayerDto } from './dto/rate-player-dto';
import { UserService } from './user.service';

@UseGuards(JwtGaurd)
@Controller('users')
export class UserController {
    constructor(private userService: UserService){}

    @Get('me')
    getUser(@GetUser('id') userId: number){
        console.log('get user')
        return this.userService.getUserById(userId)
    }

    @Get('')
    getUsers(){
        console.log('get users')
        return this.userService.getUsers()
    }

    @Get(':id')
    getUserById(@Param('id', ParseIntPipe) userId: number){
        console.log('get user')
        return this.userService.getUserById(userId)
    }


    @Patch()
    editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto){
        console.log('edit user')
        return this.userService.editUser(userId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookingById(@GetUser('id') userId:number){
        return this.userService.deleteUserById(userId)
        
    }

    @Post('rate')
    ratePlayer(@GetUser('id') raterId: number, @Body() dto: ratePlayerDto) {
        return this.userService.ratePlayer(raterId, dto);
    }
}
