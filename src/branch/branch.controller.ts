import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { GetVenue } from '../auth/decorator';
import { BranchService } from './branch.service';
import { CreateBranchDto, EditBranchDto } from './dto';

@Controller('branches')
export class BranchController {
    constructor(private branchService: BranchService){}

    @Get()
    getBranches(){
        return this.branchService.getBranches()
    }

    @Get()
    getBranchesByVenueId(@GetVenue('id') venueId: number){
        return this.branchService.getBranchesByVenueId(venueId)
    }

    @Get(':id')
    getBranchById(@Param('id', ParseIntPipe) branchId:number ){
        return this.branchService.getBranchById(branchId)

    }

    @Post()
    createBranch(@GetVenue('id') venueId:number, @Body() dto:CreateBranchDto){
        return this.branchService.createBranch(venueId,dto)
    }

    @Patch(':id')
    editBranchById(@GetVenue('id') venueId:number, @Param('id', ParseIntPipe) branchId: number,@Body() dto:EditBranchDto){
        return this.branchService.editBranchById(venueId,branchId,dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBranchById(@GetVenue('id') venueId:number, @Param('id', ParseIntPipe) branchId:number){
        return this.branchService.deleteBranchById(venueId,branchId)
        
    }



}
