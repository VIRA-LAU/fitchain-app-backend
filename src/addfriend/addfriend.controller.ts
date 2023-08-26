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
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from '../auth/gaurd';
import { AddfriendService } from './addfriend.service';
import { CreateFriendRequestDto, EditFriendRequestDto } from './dto';

@UseGuards(JwtGaurd)
@Controller('friendrequests')
export class AddfriendController {
  constructor(private addfriendService: AddfriendService) {}

  @Get()
  getSentRequests(@GetUser('id') userId: number) {
    return this.addfriendService.getSentRequests(userId);
  }

  @Get('received')
  getRecievedRequests(@GetUser('id') userId: number) {
    return this.addfriendService.getRecievedRequests(userId);
  }

  @Get(':id')
  getSentRequestById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) requestId: number,
  ) {
    return this.addfriendService.getSentRequestById(userId, requestId);
  }

  @Get('received/:id')
  getReceivedRequestById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) requestId: number,
  ) {
    return this.addfriendService.getReceivedRequestById(userId, requestId);
  }

  @Post()
  createRequest(
    @GetUser('id') userId: number,
    @Body() dto: CreateFriendRequestDto,
  ) {
    return this.addfriendService.createRequest(userId, dto);
  }

  @Patch(':id')
  editRequestById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) requestId: number,
    @Body() dto: EditFriendRequestDto,
  ) {
    return this.addfriendService.editRequestById(userId, requestId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteRequestById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) requestId: number,
  ) {
    return this.addfriendService.deleteRequestById(userId, requestId);
  }
}
