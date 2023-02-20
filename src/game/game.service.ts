import { ForbiddenException, Injectable } from '@nestjs/common';
import { gameStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createBookingDto } from './dto/create-booking.dto';
import { editBookingDto } from './dto/edit-booking.dto';

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService){}

    async getBookings(userId: number){
        return this.prisma.game.findMany({
            where:{
                adminId: userId,
                status: gameStatus.APPROVED
            },
            select:{
                date:true,
                duration:true,
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
                }
            }
        })
    }

   async getBookingById(userId:number, bookingId:number){
        const booking = await this.prisma.game.findFirst({ 
            where:{
                id:bookingId,
                adminId: userId,
                
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
}
