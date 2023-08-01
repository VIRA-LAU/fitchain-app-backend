import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeslotsService {
  constructor(private prisma: PrismaService) {}

  async getTimeSlots() {
    return await this.prisma.timeSlot.findMany({
      select: {
        id: true,
        startTime: true,
        endTime: true,
        courtId: true,
      },
    });
  }

  async getTimeSlotsInBranch(branchId: number) {
    return await this.prisma.timeSlot.findMany({
      where: {
        court: {
          branchId,
        },
      },
      include: {
        court: true,
      },
    });
  }
}
