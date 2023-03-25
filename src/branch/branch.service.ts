import { ForbiddenException, Injectable } from '@nestjs/common';
import { gameType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, EditBranchDto } from './dto';

@Injectable()
export class BranchService {
    constructor(private prisma: PrismaService) { }

    async getBranches() {

        const BranchesWithVenue = await this.prisma.branch.findMany({
            select: {
                location: true,
                venue: {
                    select:{
                        id:true,
                        name:true,
                    }
                },
                courts: {
                    select: {
                        id: true,
                        courtType: true,
                        price: true,
                        rating: true,
                        branchId: true
                    }
                }
            }
       
        });

        return BranchesWithVenue;
    }

    async getBranchById(branchId: number) {
        const branch = await this.prisma.branch.findFirst({
            where: {
                id: branchId,
            }
        })
        return branch;

    }

    async getBranchesByVenueId(venueId: number) {
        const branches = await this.prisma.branch.findMany({
            where: {
                venueId,
            },
            select: {
                location: true,
                venue: {
                    select:{
                        id:true,
                        name:true,
                    }
                },
                courts: {
                    select: {
                        id: true,
                        courtType: true,
                        price: true,
                        rating: true,
                        branchId: true
                    }
                }
            }
        })
        return branches;

    }

    async searchForBranches(date: string, gameType: gameType, startTime?: string, endTime?: string, venueId?: number) {
        if (startTime) {
            const timeSlots = await this.prisma.timeSlot.findMany({
                where: {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gte: endTime } }
                    ]
                }
            })
            let timeSlotIds = timeSlots.map(timeSlot => timeSlot.id)
            const gamesInTimeSlots = await this.prisma.game.findMany({
                where: {
                    AND: [
                        { timeSlotId: { in: timeSlotIds } },
                        { date: {
                            gte: new Date(date),
                            lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                        } }
                    ]
                }
            })
            const occupiedCourtIds = gamesInTimeSlots.map(game => game.courtId)
            const branches = await this.prisma.branch.findMany({
                where: {
                    AND: [
                        {
                            courts: {
                                some: {
                                    AND: [
                                        { hasTimeSlot: {
                                            some: {
                                                timeSlotId: {
                                                    in: timeSlotIds
                                                }
                                            }
                                        }},
                                        { NOT: { id: { in: occupiedCourtIds }}},
                                        { courtType: gameType },
                                    ]
                                }
                            }
                        },
                        venueId ? { venueId } : {}
                    ]
                },
                select: {
                    location: true,
                    venue: {
                        select:{
                            id:true,
                            name:true,
                        }
                    },
                    courts: {
                        where: {
                            AND: [
                                { hasTimeSlot: {
                                    some: {
                                        timeSlotId: {
                                            in: timeSlotIds
                                        }
                                    }
                                }},
                                { NOT: { id: { in: occupiedCourtIds }}},
                                { courtType: gameType }
                            ]
                        },
                        select: {
                            id: true,
                            courtType: true,
                            price: true,
                            rating: true,
                            branchId: true,
                            hasTimeSlot: {
                                where: {
                                    timeSlotId: {in: timeSlotIds}
                                },
                                select: {
                                    timeSlot: true
                                }
                            }
                        }
                    }
                },
            })
            return branches;
        } else {
            const gamesInDate = await this.prisma.game.findMany({ where: { date: {
                                                                gte: new Date(date),
                                                                lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                                                                } } })
            const existingGames = gamesInDate.map(game => ({courtId: game.courtId, timeSlotId: game.timeSlotId}))
            const branches = await this.prisma.branch.findMany({
                where: {
                    AND: [
                        {
                            courts: {
                                some: {
                                    AND: [
                                        { courtType: gameType },
                                        {
                                            NOT : {
                                                OR: existingGames.map(game => ({
                                                    AND: [
                                                        { hasTimeSlot: {
                                                            some: {
                                                                timeSlotId: game.timeSlotId
                                                            }
                                                        }},
                                                        { id: game.courtId }
                                                    ]
                                                }))
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        venueId ? { venueId } : {}
                    ]
                },
                select: {
                    location: true,
                    venue: {
                        select:{
                            id:true,
                            name:true,
                        }
                    },
                    courts: {
                        where: {
                            AND: [
                                { courtType: gameType },
                                {
                                    NOT : {
                                        OR: existingGames.map(game => ({
                                            AND: [
                                                { hasTimeSlot: {
                                                    some: {
                                                        timeSlotId: game.timeSlotId
                                                    }
                                                }},
                                                { id: game.courtId }
                                            ]
                                        }))
                                    }
                                }
                            ]
                        },
                        select: {
                            id: true,
                            courtType: true,
                            price: true,
                            rating: true,
                            branchId: true,
                            hasTimeSlot: {
                                select: {
                                    timeSlot: true
                                }
                            }
                        }
                    }
                },
            })
            return branches;
        }
    }

    async createBranch(venueId: number, dto: CreateBranchDto){
        const branch = await this.prisma.branch.create({ 
            data:{
                venueId: venueId,
                ...dto
            }
        })
        return branch; 
    }

    async editBranchById(venueId: number, branchId:number, dto: EditBranchDto){
        const branch = await this.prisma.branch.findUnique({
            where:{
                id:branchId
            }
        })

        if(!branch || branch.venueId != venueId)
             throw new ForbiddenException("Access to edit denied")
        
             return this.prisma.branch.update({
                where:{
                    id:branchId
                },
                data:{
                    ...dto
                }
             })
    }

    async deleteBranchById(venueId:number,branchId:number){
        const branch = await this.prisma.branch.findUnique({
            where:{
                id:branchId
            }
        })

        if(!branch || branch.venueId != venueId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.branch.delete({
            where:{
                id:branchId
            }
        })
        
    }
}
