import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGaurd } from '../auth/gaurd';
import { EditUserDto } from './dto/edit-user.dto';
import { UserService } from './user.service';

@UseGuards(JwtGaurd)
@Controller('users')
export class UserController {
    constructor(private userService: UserService){}

    @Get('me')
    getUser(@GetUser() user:User, @GetUser('email') email: string){
        return user
    }

    @Patch()
    editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto){
        return this.userService.editUser(userId,dto)
    }


}
