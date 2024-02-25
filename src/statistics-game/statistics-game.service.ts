// import { Injectable } from '@nestjs/common';
// import { StatisticsGameStatus } from '@prisma/client';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateStatisticsGameDto, EditStatisticsGameDto } from './dto';

// @Injectable()
// export class StatisticsGameService {
//   constructor(private prisma: PrismaService) {}

//   async getGames(status?: StatisticsGameStatus[]) {
//     const games = await this.prisma.statisticsGame.findMany({
//       where: {
//         status: { in: status },
//       },
//       include: {
//         admin: {
//           select: { firstName: true, lastName: true },
//         },
//       },
//     });
//     return games;
//   }

//   async getGamesByUserId(userId: number) {
//     const games = await this.prisma.statisticsGame.findMany({
//       where: {
//         adminId: userId,
//       },
//     });
//     return games;
//   }

//   async getGameById(gameId: number) {
//     const game = await this.prisma.statisticsGame.findUnique({
//       where: {
//         id: gameId,
//       },
//       include: {
//         playerStatistics: {
//           orderBy: {
//             gameNumber: 'asc',
//           },
//         },
//       },
//     });
//     return game;
//   }

//   async createGame(userId: number, dto: CreateStatisticsGameDto) {
//     const startTime = new Date(dto.startTime);
//     const endTime = new Date(dto.endTime);

//     const game = await this.prisma.statisticsGame.create({
//       data: {
//         adminId: userId,
//         status: StatisticsGameStatus.PENDING,
//         ...dto,
//         startTime,
//         endTime,
//       },
//     });
//     return game;
//   }

//   async editGame(gameId: number, dto: EditStatisticsGameDto) {
//     const { status, playerStatistics } = dto;

//     await this.prisma.statisticsGamePlayer.deleteMany({
//       where: {
//         statisticsGameId: gameId,
//       },
//     });

//     for await (const playerData of playerStatistics) {
//       await this.prisma.statisticsGamePlayer.create({
//         data: {
//           ...playerData,
//           statisticsGameId: gameId,
//         },
//       });
//     }

//     if (status)
//       await this.prisma.statisticsGame.update({
//         where: {
//           id: gameId,
//         },
//         data: {
//           status,
//         },
//       });
//   }
// }
