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
    // const videoPath = await this.s3.checkAIVideos(
    //   'detection_output/concatenated',
    //   gameId,
    // );
    await this.prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        homePoints: dto.team_1.points,
        awayPoints: dto.team_2.points,
        updatedHomePoints: dto.team_1.points,
        updatedAwayPoints: dto.team_2.points,
        // homePossession: dto.team_1.possession,
        // awayPossession: dto.team_2.possession,
        highlights,
        // videoPath: videoPath.length > 0 ? videoPath[0] : undefined,
      },
    });
    await this.prisma.playerStatistics.createMany({
      data: dto.team_1.players.map((player, index) => ({
        ...player[Object.keys(player)[0]],
        processedId: index + 1,
        team: 'HOME',
        gameId,
      })),
    });
    await this.prisma.playerStatistics.createMany({
      data: dto.team_2.players.map((player, index) => ({
        ...player[Object.keys(player)[0]],
        processedId: index + 12,
        team: 'AWAY',
        gameId,
      })),
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
