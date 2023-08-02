import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto, EditCourtDto } from './dto';
import { TimeSlot } from '@prisma/client';

@Injectable()
export class CourtService {
  constructor(private prisma: PrismaService) {}

  getCourts(branchId?: number, venueId?: number) {
    return this.prisma.court.findMany({
      where: {
        AND: [
          branchId
            ? {
                branchId,
              }
            : {},
          venueId
            ? {
                branch: {
                  venueId,
                },
              }
            : {},
        ],
      },
      include: {
        branch: {
          select: {
            location: true,
            latitude: true,
            longitude: true,
            venue: {
              select: {
                name: true,
              },
            },
          },
        },
        timeSlots: true,
      },
    });
  }

  async getCourtById(courtId: number) {
    const court = await this.prisma.court.findFirst({
      where: {
        id: courtId,
      },
    });
    return court;
  }

  async createCourt(branchId: number, dto: CreateCourtDto) {
    const timeSlots = dto.timeSlots;
    delete dto.timeSlots;

    const court = await this.prisma.court.create({
      data: {
        ...(dto as Omit<CreateCourtDto, 'timeSlots'>),
        branchId,
      },
    });

    await this.prisma.timeSlot.createMany({
      data: timeSlots.map((slot) => ({
        courtId: court.id,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime),
      })),
    });

    return court;
  }

  async editCourtById(courtId: number, dto: EditCourtDto) {
    const dtoTimeSlots = dto.timeSlots;
    delete dto.timeSlots;

    const court = await this.prisma.court.findUnique({
      where: {
        id: courtId,
      },
      include: {
        timeSlots: true,
      },
    });

    if (!court) throw new ForbiddenException('Access to edit denied');
    else {
      const toAdd: TimeSlot[] = [];
      const toDelete: number[] = [];

      for (var slot of dtoTimeSlots) {
        const existingSlot = court.timeSlots.find(
          (existingSlot) => existingSlot.id === slot.id,
        );
        if (existingSlot) {
          if (
            existingSlot.startTime !== slot.startTime ||
            existingSlot.endTime !== slot.endTime
          )
            await this.prisma.timeSlot.update({
              where: {
                id: slot.id,
              },
              data: {
                startTime: slot.startTime,
                endTime: slot.endTime,
              },
            });
        } else toAdd.push(slot);
      }

      court.timeSlots.forEach((existingSlot) => {
        if (!dtoTimeSlots.map((slot) => slot.id).includes(existingSlot.id)) {
          toDelete.push(existingSlot.id);
        }
      });

      await this.prisma.timeSlot.deleteMany({
        where: {
          id: {
            in: toDelete,
          },
        },
      });

      await this.prisma.timeSlot.createMany({
        data: toAdd.map((slot) => ({
          courtId: court.id,
          ...slot,
        })),
      });

      return this.prisma.court.update({
        where: {
          id: courtId,
        },
        data: {
          ...(dto as Omit<EditCourtDto, 'timeSlots'>),
        },
      });
    }
  }

  async deleteCourtById(venueId: number, courtId: number) {
    const court = await this.prisma.court.findUnique({
      where: {
        id: courtId,
      },
    });

    const branch = await this.prisma.branch.findFirst({
      where: {
        id: court.branchId,
      },
    });

    if (!branch || branch.venueId != venueId)
      throw new ForbiddenException('Access to edit denied');

    await this.prisma.court.delete({
      where: {
        id: courtId,
      },
    });
  }
}
