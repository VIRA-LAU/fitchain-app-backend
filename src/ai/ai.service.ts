import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameStatisticsDto } from './dto';
import { AWSS3Service } from 'src/aws-s3/aws-s3.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { GameService } from 'src/game/game.service';

@Injectable()
export class AIService {
  constructor(
    private prisma: PrismaService,
    private gameService: GameService,
    private notificationsService: NotificationsService,
    private s3: AWSS3Service,
  ) {}

  async updateGameStatistics(gameId: number, dto: GameStatisticsDto) {
    const highlights = await this.s3.checkAIVideos(
      'detection_output/highlights',
      gameId,
    );
    const videoPath = await this.s3.checkAIVideos(
      'detection_output/concatenated',
      gameId,
    );
    await this.prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        homePoints: dto.team_1.points,
        awayPoints: dto.team_2.points,
        updatedHomePoints: dto.team_1.points,
        updatedAwayPoints: dto.team_2.points,
        homePossession: dto.team_1.possession,
        awayPossession: dto.team_2.possession,
        totalPasses: dto.total_passes,
        totalAssists: dto.total_assists,
        highlights,
        videoPath: videoPath.length > 0 ? videoPath[0] : undefined,
        status: 'RESULTSPROCESSED',
      },
    });

    if (dto.team_1.players)
      await this.prisma.playerStatistics.createMany({
        data: Object.keys(dto.team_1.players).map((playerKey) => {
          const player = dto.team_1.players[playerKey];
          return {
            gameId,
            team: 'HOME',
            processedId: parseInt(playerKey),
            twoPointsMade: player['2points'],
            threePointsMade: player['3points'],
            scored: player['shotsmade'],
            missed: player['shotsmissed'],
            accuracy: player['shots_accuracy'],
          };
        }),
      });

    if (dto.team_2.players)
      await this.prisma.playerStatistics.createMany({
        data: Object.keys(dto.team_2.players).map((playerKey) => {
          const player = dto.team_2.players[playerKey];
          return {
            gameId,
            team: 'AWAY',
            processedId: parseInt(playerKey),
            twoPointsMade: player['2points'],
            threePointsMade: player['3points'],
            scored: player['shotsmade'],
            missed: player['shotsmissed'],
            accuracy: player['shots_accuracy'],
          };
        }),
      });

    const players = await this.gameService.getPlayers(gameId);

    this.notificationsService.sendNotification(
      players.map((player) => player.notificationsToken),
      'Game Statistics Available!',
      'Your game footage has been processed, you can now check the results.',
      `game/${gameId}`,
    );
    return 'success';
  }
}
