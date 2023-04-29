import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimeslotsDto, DeleteTimeSlotDto } from './dto';

@Injectable()
export class TimeslotsService {
    constructor(private prisma: PrismaService){}

    async getCourtTimeslots(courtId: number){
        const courtTimeSlots = await this.prisma.courtTimeSlots.findMany({
            where: {
                courtId: courtId,
            }
        });
        let timeSlots = [];
        for (let i = 0; i < courtTimeSlots.length; i++){
            let timeSlot = await this.prisma.timeSlot.findFirst({
                where: {
                    id: courtTimeSlots[i].timeSlotId
                }
            });
            timeSlots.push(timeSlot);
        }
        return timeSlots;
    }

    async addCourtTimeSlot(timeSlotInfo: CreateTimeslotsDto) {
        let timeSlot = await this.prisma.timeSlot.findFirst({
            where: {
                startTime: timeSlotInfo.startTime,
                endTime: timeSlotInfo.endTime
            }
        });
        if (timeSlot === null) {
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
        if (timeSlot !== null) {
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
