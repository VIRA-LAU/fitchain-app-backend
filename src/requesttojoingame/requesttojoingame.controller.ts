import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from '../auth/gaurd';
import { EditRequestToJoinDto, CreateRequestToJoinDto } from './dto';
import { RequesttojoingameService } from './requesttojoingame.service';

@UseGuards(JwtGaurd)
@Controller('gamerequests')
export class RequesttojoingameController {
    constructor(private requesttojoingameService: RequesttojoingameService){}

    @Get()
    getSentRequests(@GetUser('id') userId:number){
        return this.requesttojoingameService.getSentRequests(userId)

    }

    @Get('received')
    getRecievedRequests(@GetUser('id') userId: number) {
        return this.requesttojoingameService.getRecievedRequests(userId)

    }

    @Get(':id')
    getSentRequestById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) requestId:number ){
        return this.requesttojoingameService.getSentRequestById(userId,requestId)

    }

    @Get('received/:id')
    getReceivedRequestById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) requestId:number ){
        return this.requesttojoingameService.getReceivedRequestById(userId,requestId)

    }

    @Post()
    createRequest(@GetUser('id') userId:number, @Body() dto:CreateRequestToJoinDto){
        return this.requesttojoingameService.createRequest(userId,dto)
    }

    @Patch(':id')
    editRequestById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) requestId: number,@Body() dto:EditRequestToJoinDto){
        return this.requesttojoingameService.editRequestById(userId,requestId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete()
    deleteRequestByGameId(@GetUser('id') userId:number, @Query('gameId', ParseIntPipe) gameId:number){
        return this.requesttojoingameService.deleteRequestByGameId(userId, gameId)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteRequestById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) requestId:number){
        return this.requesttojoingameService.deleteRequestById(userId,requestId)
    }

}
