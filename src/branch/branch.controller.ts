import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { gameType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { BranchService } from './branch.service';
import { CreateBranchDto, EditBranchDto } from './dto';

@Controller('branches')
export class BranchController {
    constructor(private branchService: BranchService){}

    @Get()
    getBranches(@Query('venueId') venueId?: string){
        if (!venueId)
            return this.branchService.getBranches()
        return this.branchService.getBranchesByVenueId(parseInt(venueId))
    }
    
    @Get("bookings/:id")
    getBookingsInVenue(@Param('id', ParseIntPipe) branchId:number, @Query('date') date: string) {
        return this.branchService.getBookingsInBranch(branchId, new Date(date))
    }

    @Get('search')
    searchForBranches(@Query('date') date?: string, @Query('startTime') startTime?: string,
        @Query('endTime') endTime?: string, @Query('gameType') gameType?: gameType,
        @Query('venueId') venueId?: string, @Query('nbOfPlayers', ParseIntPipe) nbOfPlayers?: number){
            return this.branchService.searchForBranches(date, gameType, nbOfPlayers, startTime, endTime, parseInt(venueId))
    }

    @Get(':id')
    getBranchById(@Param('id', ParseIntPipe) branchId:number){
        return this.branchService.getBranchById(branchId)
    }

    // @Post()
    // createBranch(@GetUser('id') venueId:number, @Body() dto:CreateBranchDto){
    //     return this.branchService.createBranch(venueId,dto)
    // }

    @Patch(':id')
    editBranchById(@GetUser('id') venueId:number, @Param('id', ParseIntPipe) branchId: number,@Body() dto:EditBranchDto){
        return this.branchService.editBranchById(venueId,branchId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBranchById(@GetUser('id') venueId:number, @Param('id', ParseIntPipe) branchId:number){
        return this.branchService.deleteBranchById(venueId,branchId)
        
    }



}
