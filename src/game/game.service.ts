import { ForbiddenException, Injectable } from '@nestjs/common';
import { gameStatus, invitationApproval } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createBookingDto } from './dto/create-booking.dto';
import { editBookingDto } from './dto/edit-booking.dto';

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService){}

    async getBookings() {
        return this.prisma.game.findMany({
            where:{
                status: gameStatus.APPROVED
            },
            select:{
                id: true,
                date:true,
                duration:true,
                type: true,
                adminTeam: true,
                court: {
                    select:{
                        branch:{
                            select:{
                                location: true,
                                venue:{
                                    select:{
                                        name:true
                                    }
                                }
                                
                            }
                            
                        }
                    }
                },
                gameRequests:{
                    where:{
                        status: invitationApproval.APPROVED
                    },
                    select:{
                        team: true,
                        user:{
                            select:{
                                id:true
                            }
                        }
                    }
                },
                gameInvitation:{
                    where:{
                        status: invitationApproval.APPROVED
                    },
                    select:{
                        team: true,
                        friend:{
                            select:{
                                id:true
                            }
                        }
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

   async getBookingById(bookingId:number){
        const booking = await this.prisma.game.findFirst({ 
            where:{
                id:bookingId,
                
            }
        })
        return booking; 
    }
 
    async createBooking(userId: number, dto: createBookingDto){
        const booking = await this.prisma.game.create({ 
            data:{
                adminId: userId,
                ...dto
            }
        })
        return booking; 
    }

    async editBookingById(userId: number, bookingId:number, dto: editBookingDto){
        const booking = await this.prisma.game.findUnique({
            where:{
                id:bookingId
            }
        })

        if(!booking || booking.adminId != userId)
             throw new ForbiddenException("Access to edit denied")
        
             return this.prisma.game.update({
                where:{
                    id:bookingId
                },
                data:{
                    ...dto
                }
             })
    }

    async deleteBookingById(userId:number,bookingId:number){
        const booking = await this.prisma.game.findUnique({
            where:{
                id:bookingId
            }
        })

        if(!booking || booking.adminId != userId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.game.delete({
            where:{
                id:bookingId
            }
        })
        
    }

    async getUpcomings(userId: number) {
        const upcomings = await this.prisma.game.findMany({ 
            where:{
                OR: [
                    { adminId: userId },
                    {
                        gameInvitation: {
                            some: {
                            friendId: userId
                        }
                        }
                    },
                    {
                        gameRequests: {
                            some: {
                                userId:userId
                            }
                    }}
                ]
            },
            select:{
                id: true,
                date:true,
                duration:true,
                adminTeam: true,
                type: true,
                court: {
                    select:{
                        branch:{
                            select:{
                                location: true,
                                venue:{
                                    select:{
                                        name:true
                                    }
                                }
                                
                            }
                            
                        }
                    }
                },
                gameRequests:{
                    select:{
                        team: true
                    }
                },
                gameInvitation:{
                    select:{
                        team: true
                    }
                },
                admin: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })
        return upcomings; 
    }

    async getUpcomingById(userId:number, upcomingId:number){
        const upcoming = await this.prisma.game.findFirst({ 
            where:{
                id:upcomingId,
                adminId: userId,
                
            }
        })
        return upcoming; 
    }

    async getPlayerGameStatus(userId: number, gameId: number) {
        const gameStatus = await this.prisma.game.findFirst({
          where: {
            id: gameId,
          },
          include: {
            gameRequests: {
              where: {
                userId: userId,
              },
              select:{
                status:true,
              }
            },
            gameInvitation: {
              where: {
                friendId: userId,
              },
              select:{
                status:true,
              }
            },
          },
        });
    
        const userStatus = {
          hasRequestedtoJoin: gameStatus?.gameRequests?.length>0? gameStatus.gameRequests[0].status:false,
          hasBeenInvited: gameStatus?.gameInvitation?.length>0? gameStatus.gameInvitation[0].status:false,
          isAdmin: gameStatus.adminId === userId,
        };
        return userStatus;
      }
      

    async getActivities(userId: number) {
        const selectedFields = {
            date:true,
            type: true,
            winnerTeam: true
        }
        const adminActivities = (await this.prisma.game.findMany({ 
            where:{                
                AND: [
                    { adminId: userId },
                    {status: gameStatus.FINISHED}
                ],
            },
            select:{
                ...selectedFields,
                adminTeam: true,
            },
        })).map(({date, type, winnerTeam, adminTeam}) => ({
            date, type, isWinner: winnerTeam === adminTeam
        }))
        const invitedActivities = (await this.prisma.game.findMany({ 
            where:{
                AND: [{
                    gameInvitation: {
                        some: {
                        friendId: userId
                    }
                    }
                },
                    {status: gameStatus.FINISHED}
                ],
            },
            select:{
                ...selectedFields,
                gameInvitation: {
                    select: {
                        team: true,
                    },
                }

            },
        })).map(({date, type, winnerTeam, gameInvitation}) => ({
            date, type, isWinner: winnerTeam === gameInvitation.pop().team
        }))
        const requestedActivities = (await this.prisma.game.findMany({ 
            where:{
                AND: [
                    {
                        gameRequests: {
                            some: {
                                userId:userId
                            }
                    }},
                    {status: gameStatus.FINISHED}
                ],
            },
            select:{
                ...selectedFields,
                gameRequests: {
                    select: {
                        team: true,
                    }
                },
            },
        })).map(({date, type, winnerTeam, gameRequests}) => ({
            date, type, isWinner: winnerTeam === gameRequests.pop().team
        }))

        return [
            ...adminActivities,
            ...invitedActivities,
            ...requestedActivities
        ]; 
    }

    async getUpdates(gameId: number) {
        const activities = await this.prisma.game.findMany({ 
            where:{
               id:gameId
            },
            select:{
                date:true,
                duration:true,
                type: true,
                winnerTeam: true,
                adminTeam: true,
                status: true,
                highlights: true,
                gameInvitation: {
                    orderBy:{
                        createdAt:'desc'
                    },
                    take:5
                },
                gameRequests: {
                    orderBy:{
                        createdAt:'desc'
                    },
                    take:5
                }
            }
        })
        return activities; 
    }

}
