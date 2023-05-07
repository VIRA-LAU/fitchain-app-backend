import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto, EditCourtDto } from './dto';

@Injectable()
export class CourtService {
    constructor(private prisma:PrismaService){}

    getCourts(branchId?: number, venueId?: number){
        return this.prisma.court.findMany({
            where: {
                AND: [
                    branchId ? {
                        branchId
                    } : {},
                    venueId ? {
                        branch: {
                            venueId
                        } 
                    } : {}
                ]
            },
            include: {
                branch: {
                    select: {
                        location: true,
                        latitude: true,
                        longitude: true,
                        venue: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                courtTimeSlots: true
            }
        })

    }

    async getCourtById(courtId:number){
        const court = await this.prisma.court.findFirst({ 
            where:{
                id:courtId,                
            }
        })
        return court; 
    }

    async createCourt(branchId: number, dto: CreateCourtDto){
        const timeSlots = dto.timeSlots
        delete dto.timeSlots

        const court = await this.prisma.court.create({ 
            data:{
                ...dto,
                branchId
            }
        })
        await this.prisma.courtTimeSlots.createMany({
            data: timeSlots.map(slot => ({
                courtId: court.id,
                timeSlotId: slot
            }))
        })
        return court; 
    }

    async editCourtById(courtId:number, dto: EditCourtDto){
        const dtoTimeSlots = dto.timeSlots
        delete dto.timeSlots

        const court = await this.prisma.court.findUnique({
            where:{
                id:courtId
            },
            include: {
                courtTimeSlots: {
                    select: {
                        timeSlotId: true
                    }
                }
            }
        })

        if(!court) throw new ForbiddenException("Access to edit denied")
        else {
            const existingTimeSlots = court.courtTimeSlots.map(courtTimeSlot => courtTimeSlot.timeSlotId)
            const toAdd: number[] = []
            const toDelete: number[] = []
    
            dtoTimeSlots.forEach(slot => {
                if (existingTimeSlots.indexOf(slot) === -1) {
                    toAdd.push(slot)
                }
            })
    
            existingTimeSlots.forEach(slot => {
                if (dtoTimeSlots.indexOf(slot) === -1) {
                    toDelete.push(slot)
                }
            })

            await this.prisma.courtTimeSlots.deleteMany({
                where: {
                    timeSlotId: {
                        in: toDelete
                    }
                }
            })
            
            await this.prisma.courtTimeSlots.createMany({
                data: toAdd.map(timeSlotId => ({
                    courtId: courtId,
                    timeSlotId
                }))
            })

            return this.prisma.court.update({
                where: {
                    id: courtId
                },
                data: {
                    ...dto
                }
             })
        }
    }

    async deleteCourtById(venueId:number,courtId:number){
        const court = await this.prisma.court.findUnique({
            where:{
                id:courtId
            }
        })

        const branch = await this.prisma.branch.findFirst({
            where: {
                id: court.branchId,
            }
        })

        if(!branch || branch.venueId != venueId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.court.delete({
            where:{
                id:courtId
            }
        })
        
    }

}
