import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeslotsDto, DeleteTimeSlotDto } from './dto';

@Injectable()
export class TimeslotsService {
    constructor(private prisma: PrismaService){}

    async getTimeSlots(){
        return await this.prisma.timeSlot.findMany({
            select: {
                id: true,
                startTime: true,
                endTime: true,
                courtTimeSlots: {
                    select: {
                        court: {
                            select: {
                                id: true,
                                courtType: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })
    }

    async getTimeSlotsInBranch(branchId: number){
        return await this.prisma.courtTimeSlots.findMany({
            where: {
                court: {
                    branchId
                }    
                },
            select: {
                id: true,
                timeSlot: true,
                court: true
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
