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
                        id:true
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
                    select:{
                        id: true
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

    async getActivities(userId: number) {
        const activities = await this.prisma.game.findMany({ 
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
                ],
                AND: [
                    {status: gameStatus.FINISHED}
                ],
            },
            select:{
                date:true,
                duration:true,
                type: true,
                winnerTeam: true,
            }
        })
        return activities; 
    }

}
