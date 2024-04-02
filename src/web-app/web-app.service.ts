import { Injectable } from '@nestjs/common';
import { GameStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EditStatisticsGameDto } from './dto';

@Injectable()
export class WebAppService {
  constructor(private prisma: PrismaService) {}

  async getGames(status?: GameStatus[]) {
    const games = await this.prisma.game.findMany({
      where: {
        status: { in: status },
      },
      include: {
        admin: {
          select: { firstName: true, lastName: true },
        },
      },
    });
    return games;
  }

  async getPlayerStatistics(gameId: number) {
    const game = await this.prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        playerStatistics: {
          orderBy: {
            gameNumber: 'asc',
          },
        },
      },
    });
    return game;
  }

  async editGame(gameId: number, dto: EditStatisticsGameDto) {
    const { status, playerStatistics } = dto;

    await this.prisma.playerStatistics.deleteMany({
      where: {
        gameId,
      },
    });

    for await (const playerData of playerStatistics) {
      await this.prisma.playerStatistics.create({
        data: {
          ...playerData,
          gameId,
        },
      });
    }

    if (status)
      await this.prisma.game.update({
        where: {
          id: gameId,
        },
        data: {
          status,
        },
      });
  }
}
