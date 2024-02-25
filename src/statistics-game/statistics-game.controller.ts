// import {
//   Body,
//   Controller,
//   Get,
//   Param,
//   ParseIntPipe,
//   Patch,
//   Post,
//   Query,
//   UseGuards,
// } from '@nestjs/common';
// import { StatisticsGameStatus } from '@prisma/client';
// import { GetUser } from '../auth/decorator';
// import { JwtGaurd } from '../auth/gaurd';
// import { CreateStatisticsGameDto, EditStatisticsGameDto } from './dto';
// import { StatisticsGameService } from './statistics-game.service';

// // @UseGuards(JwtGaurd)
// @Controller('statistics-games')
// export class StatisticsGameController {
//   constructor(private statisticsameService: StatisticsGameService) {}

//   @Get()
//   getGames(@Query('status') status?: StatisticsGameStatus[]) {
//     return this.statisticsameService.getGames(status);
//   }

//   @Get('/user/:userId')
//   getGamesByUserId(@Param('userId', ParseIntPipe) userId: number) {
//     return this.statisticsameService.getGamesByUserId(userId);
//   }

//   @Post('/:userId')
//   createGame(
//     @Param('userId', ParseIntPipe) userId: number,
//     // @GetUser('id') userId: number,
//     @Body() dto: CreateStatisticsGameDto,
//   ) {
//     return this.statisticsameService.createGame(userId, dto);
//   }

//   @Patch('/:gameId')
//   editGame(
//     @Param('gameId', ParseIntPipe) gameId: number,
//     @Body() dto: EditStatisticsGameDto,
//   ) {
//     return this.statisticsameService.editGame(gameId, dto);
//   }
// }
