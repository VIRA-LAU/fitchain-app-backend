import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('backup')
export class BackupController {
  constructor(private prisma: PrismaService) {}

  @Get('/')
  async backup() {
    return {
      users: await this.prisma.user.findMany(),
      venues: await this.prisma.venue.findMany(),
      branches: await this.prisma.branch.findMany(),
      courts: await this.prisma.court.findMany(),
      timeslots: await this.prisma.timeSlot.findMany(),
      games: await this.prisma.game.findMany(),
      invites: await this.prisma.inviteToGame.findMany(),
      requests: await this.prisma.requestToJoinGame.findMany(),
      follows: await this.prisma.followsGame.findMany(),
      playerStatistics: await this.prisma.playerStatistics.findMany(),
      playerRatings: await this.prisma.playerRating.findMany(),
    };
  }

  @Get('/restore')
  async restore() {
    await this.prisma.user.createMany({ data: [] });
    await this.prisma.venue.createMany({ data: [] });
    await this.prisma.branch.createMany({ data: [] });
    await this.prisma.court.createMany({ data: [] });
    await this.prisma.timeSlot.createMany({ data: [] });
    await this.prisma.game.createMany({ data: [] });
    await this.prisma.inviteToGame.createMany({ data: [] });
    await this.prisma.requestToJoinGame.createMany({ data: [] });
    await this.prisma.followsGame.createMany({ data: [] });
    await this.prisma.playerStatistics.createMany({ data: [] });
    await this.prisma.playerRating.createMany({ data: [] });
    return 'success';
  }
}
