import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeslotsDto, DeleteTimeSlotDto } from './dto';

@Injectable()
export class TimeslotsService {
    constructor(private prisma: PrismaService){}

    async getTimeSlots(courtId: number, branchId: number){
        return await this.prisma.timeSlot.findMany({
            where: {
                    AND: [
                        courtId ? {
                            courtTimeSlots: {
                                some: {
                                    courtId
                                }
                            }
                        } : {},
                        branchId ? {
                            courtTimeSlots: {
                                some: {
                                    court: {
                                        branchId
                                    }
                                }
                            }} : {}
                    ]
                },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                courtTimeSlots: {
                    select: {
                         court: {
                            select: {
                                courtType: true
                            }
                         }
                    },
                    where: {
                        AND: [
                            courtId ? {
                                courtId
                            } : {},
                            branchId ? {
                                court: {
                                    branchId
                                }
                            } : {}
                        ]
                    },
                }
            }
        })
    }

    async addCourtTimeSlot(timeSlotInfo: CreateTimeslotsDto) {
        let timeSlot = await this.prisma.timeSlot.findFirst({
            where: {
                startTime: timeSlotInfo.startTime,
                endTime: timeSlotInfo.endTime
            }
        });
        if (!timeSlot) {
            timeSlot = await this.prisma.timeSlot.create({
                data: {
                    startTime: timeSlotInfo.startTime,
                    endTime: timeSlotInfo.endTime
                }
            });
        }

        const courtTimeslot = await this.prisma.courtTimeSlots.create({
            data: {
                courtId: timeSlotInfo.courtId,
                timeSlotId: timeSlot.id,
            }
        });
        return courtTimeslot;
    }

    async addGameTimeSlot(gameId: number, timeslotId: number) {
        const newTimeslot = await this.prisma.gameTimeSlots.create({
            data: {
                gameId: gameId,
                timeSlotId: timeslotId
            }
        });
        return newTimeslot;
    }

    async deleteTimeSlot(dto: DeleteTimeSlotDto) {
        const timeSlot = await this.prisma.courtTimeSlots.findFirst({
            where: {
                courtId: dto.courtId,
                timeSlotId: dto.timeslotId
            }
        })
        if (timeSlot) {
            const deletedTimeSlot = await this.prisma.courtTimeSlots.deleteMany({
                where: {
                    id: timeSlot.id
                }
            });
            return deletedTimeSlot;
        }
        else return "No timeslot found";
    }
}
