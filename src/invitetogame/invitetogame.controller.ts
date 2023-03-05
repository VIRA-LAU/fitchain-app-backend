import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from '../auth/gaurd';
import { CreateInvitationDto, EditInvitationDto } from './dto';
import { InvitetogameService } from './invitetogame.service';

@UseGuards(JwtGaurd)
@Controller('invitations')
export class InvitetogameController {
    constructor(private invitetogameService: InvitetogameService){}
    
    @Get()
    getSentInvitations(@GetUser('id') userId:number){
        return this.invitetogameService.getSentInvitations(userId)

    }

    @Get('received')
    getRecievedInvitations(@GetUser('id') userId: number) {
        return this.invitetogameService.getReceivedInvitations(userId)

    }

    @Get(':id')
    getSentInvitationById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) invitationId:number ){
        return this.invitetogameService.getSentInvitationById(userId,invitationId)

    }

    @Get('received/:id')
    getReceivedInvitationById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) invitationId:number ){
        return this.invitetogameService.getReceivedInvitationById(userId,invitationId)

    }

    @Post()
    createInvitation(@GetUser('id') userId:number, @Body() dto:CreateInvitationDto){
        return this.invitetogameService.createInvitation(userId,dto)
    }

    @Patch(':id')
    editInvitationById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) invitationId: number,@Body() dto:EditInvitationDto){
        return this.invitetogameService.editInvitationById(userId,invitationId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteInvitationById(@GetUser('id') userId:number, @Param('id', ParseIntPipe) invitationId:number){
        return this.invitetogameService.deleteInvitationById(userId,invitationId)
        
    }
}
