import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { GetVenue } from '../auth/decorator';
import { BranchService } from './branch.service';

@Controller('branches')
export class BranchController {
    constructor(private branchService: BranchService){}

    @Get()
    getVenues(){
        return this.branchService.getBranches()
    }

    @Get('id')
    getVenueById(@Param('id', ParseIntPipe) branchId:number ){
        return this.branchService.getBranchesById(branchId)

    }



}
