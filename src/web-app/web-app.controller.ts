import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { GameStatus } from '@prisma/client';
import { EditStatisticsGameDto } from './dto';
import { WebAppService } from './web-app.service';

@Controller('web-app')
export class WebAppController {
  constructor(private webAppService: WebAppService) {}

  @Get('games')
  getGames(@Query('status') status?: GameStatus[]) {
    return this.webAppService.getGames(status);
  }

  @Get('player-statistics/:gameId')
  getPlayerStatistics(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.webAppService.getPlayerStatistics(gameId);
  }

  @Patch('edit/:gameId')
  editGame(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() dto: EditStatisticsGameDto,
  ) {
    return this.webAppService.editGame(gameId, dto);
  }
}
