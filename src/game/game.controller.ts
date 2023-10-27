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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { GameType } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGaurd } from '../auth/gaurd';
import { createBookingDto, editBookingDto } from './dto';
import { GameService } from './game.service';
import { SocketGateway } from 'src/socket.gateway';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';

@UseGuards(JwtGaurd)
@Controller('games')
export class GameController {
  constructor(
    private gameService: GameService,
    private readonly socketGateway: SocketGateway,
  ) {}

  @Get()
  getGames(
    @GetUser('id') userId: number,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ) {
    return this.gameService.getGames(userId, parseInt(limit), type);
  }

  @Get('search')
  searchGames(
    @GetUser('id') userId: number,
    @Query('gameType') gameType: GameType,
    @Query('nbOfPlayers', ParseIntPipe) nbOfPlayers: number,
    @Query('date') date?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    return this.gameService.searchGames(
      userId,
      gameType,
      nbOfPlayers,
      date,
      startTime,
      endTime,
    );
  }

  @Get('getTeam/:id')
  getPlayerTeam(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.getPlayerTeam(userId, gameId);
  }

  @Get('bookings')
  getBookings(@Query('type') type?: string) {
    return this.gameService.getBookings(type);
  }

  @Get('activities/:userId')
  getActivities(@Param('userId', ParseIntPipe) userId: number) {
    return this.gameService.getActivities(userId);
  }

  @Get('count/:userId')
  getGameCount(@Param('userId', ParseIntPipe) userId: number) {
    return this.gameService.getGameCount(userId);
  }

  @Get('followed')
  getFollowedGames(
    @GetUser('id') userId: number,
    @Query('type') type?: string,
  ) {
    return this.gameService.getFollowedGames(userId, type);
  }

  @Get('playerstatus/:gameId')
  getPlayerGameStatus(
    @GetUser('id') userId: number,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.getPlayerGameStatus(userId, gameId);
  }

  @Get('players/:gameId')
  getPlayersOfGame(
    @GetUser('id') userId: number,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.getPlayers(gameId, userId);
  }

  @Get('updates/:gameId')
  getUpdates(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.gameService.getUpdates(gameId);
  }

  @Get('/:gameId')
  getGameById(@Param('gameId', ParseIntPipe) upcomingId: number) {
    return this.gameService.getGameById(upcomingId);
  }

  @Post('follow/:gameId')
  createFollowGame(
    @GetUser('id') userId: number,
    @Param('gameId', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.createFollowGame(userId, gameId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('followed')
  deleteFollowById(
    @GetUser('id') userId: number,
    @Query('gameId') gameId: string,
  ) {
    return this.gameService.deleteFollowById(userId, parseInt(gameId));
  }

  @Post()
  createBooking(@GetUser('id') userId: number, @Body() dto: createBookingDto) {
    return this.gameService.createBooking(userId, dto);
  }

  @Patch('recording/:gameId')
  startRecording(
    @GetUser('id') userId: number,
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() dto: editBookingDto,
  ) {
    this.socketGateway.server.emit(`${dto.recordingMode}_recording`, {data: gameId});
    return this.gameService.editBookingById(userId, gameId, dto);
  }

  @Patch('uploadVideo/:gameId')
  @UseInterceptors(FileInterceptor('video'))
  uploadVideo(
    @Param('gameId', ParseIntPipe) gameId: number,
    @UploadedFile()
    video?: Express.Multer.File,
  ) {
    return this.gameService.uploadVideo(gameId, video);
  }

  @Patch('assignPlayerScore/:playerStatisticsId')
  assignPlayerScore(
    @Param('playerStatisticsId', ParseIntPipe) playerStatisticsId: number,
    @Body() dto: { userId: number },
  ) {
    return this.gameService.assignPlayerScore(playerStatisticsId, dto.userId);
  }

  @Patch(':id')
  editBookingById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookingId: number,
    @Body() dto: editBookingDto,
  ) {
    return this.gameService.editBookingById(userId, bookingId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookingById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookingId: number,
  ) {
    return this.gameService.deleteBookingById(userId, bookingId);
  }
}
