import { ForbiddenException, Injectable } from '@nestjs/common';
import { gameType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, EditBranchDto } from './dto';

@Injectable()
export class BranchService {
    constructor(private prisma: PrismaService) { }

    async getBranches() {
        let branches = await this.prisma.branch.findMany({
            select: {
                location: true,
                latitude: true,
                longitude: true,
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
                        nbOfPlayers: true,
                        rating: true,
                        branchId: true
                    }
                }
            }
       
        });
        branches = branches.map(branch => ({
            ...branch,
            rating: branch.courts.length > 0 ?
                branch.courts.map(court => court.rating).reduce((a, b) => a + b, 0) / branch.courts.length : 0
        }))
        return branches;
    }

    async getBranchById(branchId: number) {
        const branch = await this.prisma.branch.findUnique({
            where: {
                id: branchId,
            },
            select: {
                location: true,
                latitude: true,
                longitude: true,
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
                        nbOfPlayers: true,
                        rating: true,
                        branchId: true
                    }
                }
            }
        })
        branch["rating"] = branch.courts.length > 0 ?
            branch.courts.map(court => court.rating).reduce((a, b) => a + b, 0) / branch.courts.length : 0
        return branch;
    }

    async getBranchesByVenueId(venueId: number) {
        let branches = await this.prisma.branch.findMany({
            where: {
                venueId,
            },
            select: {
                location: true,
                latitude: true,
                longitude: true,
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
                        nbOfPlayers: true,
                        rating: true,
                        branchId: true
                    }
                }
            }
        })
        branches = branches.map(branch => ({
            ...branch,
            rating: branch.courts.length > 0 ?
                branch.courts.map(court => court.rating).reduce((a, b) => a + b, 0) / branch.courts.length : 0
        }))
        return branches;

    }

    async getBookingsInBranch(branchId: number, date: Date) {
        return this.prisma.game.findMany({
            where:{
                AND: [
                        { court: {
                            branchId
                        }},
                        { date: {
                            gte: new Date(date),
                            lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                        }}
                    ]
                },
            orderBy: { date: 'asc' },
            select:{
                id: true,
                date:true,
                type: true,
                gameTimeSlots: {
                    select: {
                        timeSlot: true
                    }
                },
                court: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                admin: {
                    select:{
                        id:true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })
    }

    async searchForBranches(date: string, gameType: gameType, nbOfPlayers: number, 
    startTime?: string, endTime?: string, venueId?: number) {
        if (startTime) {
            const timeSlots = await this.prisma.timeSlot.findMany({
                where: {
                    AND: [
                        {         
                            OR: [
                                {
                                    AND: [
                                        { startTime: { lte: startTime } },
                                        { endTime: { gte: endTime } }
                                    ]
                                },
                                {
                                    AND: [
                                        { startTime: { lte: startTime } },
                                        { endTime: { lte: endTime } },
                                        { endTime: { gte: startTime } },
                                    ]
                                },
                                {
                                    AND: [
                                        { startTime: { gte: startTime } },
                                        { startTime: { lte: endTime } },
                                        { endTime: { gte: endTime } }
                                    ]
                                }
                            ],
                            courtTimeSlots: {
                                some: {
                                    court: {
                                        courtType: gameType
                                    }
                                }
                            }
                        }
                    ]
                }
            })
            let timeSlotIds = timeSlots.map(timeSlot => timeSlot.id)
            const gamesInTimeSlots = await this.prisma.game.findMany({
                where: {
                    AND: [
                        { gameTimeSlots: { some: {
                            timeSlotId: {in: timeSlotIds}
                        }} },
                        { date: {
                            gte: new Date(date),
                            lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                        } }
                    ]
                }
            })
            const occupiedCourtIds = gamesInTimeSlots.map(game => game.courtId)
            let branches = await this.prisma.branch.findMany({
                where: {
                    AND: [
                        {
                            courts: {
                                some: {
                                    AND: [
                                        { courtTimeSlots: {
                                            some: {
                                                timeSlotId: {
                                                    in: timeSlotIds
                                                }
                                            }
                                        }},
                                        { NOT: { id: { in: occupiedCourtIds }}},
                                        { courtType: gameType },
                                        { nbOfPlayers: { gte: nbOfPlayers }}
                                    ]
                                }
                            }
                        },
                        venueId ? { venueId } : {}
                    ]
                },
                select: {
                    location: true,
                    latitude: true,
                    longitude: true,
                    venue: {
                        select:{
                            id:true,
                            name:true,
                        }
                    },
                    courts: {
                        where: {
                            AND: [
                                { courtTimeSlots: {
                                    some: {
                                        timeSlotId: {
                                            in: timeSlotIds
                                        },
                                    }
                                }},
                                { NOT: { id: { in: occupiedCourtIds }}},
                                { courtType: gameType },
                                { nbOfPlayers: { gte: nbOfPlayers }}
                            ]
                        },
                        select: {
                            id: true,
                            name: true,
                            courtType: true,
                            nbOfPlayers: true,
                            price: true,
                            rating: true,
                            branchId: true,
                            courtTimeSlots: {
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
            branches = branches.map(branch => ({
                ...branch,
                rating: branch.courts.length > 0 ?
                    branch.courts.map(court => court.rating).reduce((a, b) => a + b, 0) / branch.courts.length : 0
            }))
            return branches;
        } else {
            const gamesInDate = await this.prisma.game.findMany({ 
                where: { 
                    AND: [
                        { date: {
                            gte: new Date(date),
                            lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                        } },
                        { type: gameType}
                    ]
                },
                select: {
                    gameTimeSlots: {
                        select: {
                            timeSlot: true
                        }
                    },
                    courtId: true
                }    
            })
            const existingGames = gamesInDate.map(game => ({courtId: game.courtId, timeSlotIds: game.gameTimeSlots.map(slot => slot.timeSlot.id)}))
            let branches = await this.prisma.branch.findMany({
                where: {
                    AND: [
                        {
                            courts: {
                                some: {
                                    AND: [
                                        { courtType: gameType },
                                        { nbOfPlayers: { gte: nbOfPlayers }}
                                    ]
                                }
                            }
                        },
                        venueId ? { venueId } : {}
                    ]
                },
                select: {
                    location: true,
                    latitude: true,
                    longitude: true,
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
                                { nbOfPlayers: { gte: nbOfPlayers }}
                            ]
                        },
                        select: {
                            id: true,
                            name: true,
                            courtType: true,
                            price: true,
                            nbOfPlayers: true,
                            rating: true,
                            branchId: true,
                            courtTimeSlots: {
                                select: {
                                    timeSlot: true,
                                    courtId: true,
                                    timeSlotId: true,
                                }
                            }
                        }
                    }
                },
            })
            branches = branches.map((branch) => {
                branch.courts = branch.courts.map(
                  (court) => {
                    court.courtTimeSlots = court.courtTimeSlots.filter(
                      ({ timeSlotId, courtId }) => !existingGames.some(
                          (existing) =>
                              existing.timeSlotIds.includes(timeSlotId) &&
                            courtId === existing.courtId,
                        )
                    );
                    return court;
                  },
                );
                branch.courts = branch.courts.filter(
                  (court) =>
                    court.courtTimeSlots.length !== 0,
                );
                return branch;
              }).filter(
                (branch) => branch.courts.length !== 0,
              );
              branches = branches.map(branch => ({
                  ...branch,
                  rating: branch.courts.length > 0 ?
                      branch.courts.map(court => court.rating).reduce((a, b) => a + b, 0) / branch.courts.length : 0
              }))
            return branches;
        }
    }

    // async createBranch(venueId: number, dto: CreateBranchDto){
    //     const branch = await this.prisma.branch.create({ 
    //         data:{
    //             venueId: venueId,
    //             ...dto,   
    //             latitude: 33.91444916242689,
    //             longitude: 35.586040802299976
    //         }
    //     })
    //     return branch; 
    // }

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
