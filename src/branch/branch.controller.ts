import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { gameType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { BranchService } from './branch.service';
import { EditBranchDto } from './dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { JwtGaurd } from 'src/auth/gaurd';

@UseGuards(JwtGaurd)
@Controller('branches')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Get()
  getBranches(@Query('venueId') venueId?: string) {
    if (!venueId) return this.branchService.getBranches();
    return this.branchService.getBranchesByVenueId(parseInt(venueId));
  }

  @Get('bookings/:id')
  getBookingsInVenue(
    @Param('id', ParseIntPipe) branchId: number,
    @Query('date') date: string,
  ) {
    return this.branchService.getBookingsInBranch(branchId, new Date(date));
  }

  @Get('search')
  searchForBranches(
    @Query('date') date?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('gameType') gameType?: gameType,
    @Query('venueId') venueId?: string,
    @Query('nbOfPlayers', ParseIntPipe) nbOfPlayers?: number,
  ) {
    return this.branchService.searchForBranches(
      date,
      gameType,
      nbOfPlayers,
      startTime,
      endTime,
      parseInt(venueId),
    );
  }

  @Get(':id')
  getBranchById(@Param('id', ParseIntPipe) branchId: number) {
    return this.branchService.getBranchById(branchId);
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'coverPhoto', maxCount: 1 },
      { name: 'branchPhotos', maxCount: 2 },
    ]),
  )
  editBranch(
    @GetUser('id') branchId: number,
    @Body() dto: EditBranchDto,
    @UploadedFiles()
    images?: {
      coverPhoto?: Express.Multer.File[];
      branchPhotos?: Express.Multer.File[];
    },
  ) {
    return this.branchService.editBranchById(branchId, dto, images);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete()
  deleteBranchById(@GetUser('id') branchId: number) {
    return this.branchService.deleteBranchById(branchId);
  }
}
