import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditVenueDto } from './dto';

@Injectable()
export class VenueService {
    constructor(private prisma: PrismaService){}

    async getVenues(){
        let venues = await this.prisma.venue.findMany({
            select:{
                name: true,
                branches:{
                    select:{
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
                                rating: true,
                                branchId: true
                            }
                        }
                    }
                }
            }
        });
        venues = venues.map(venue => {
            let branches = venue.branches.map(branch => ({
                ...branch,
                rating: branch.courts.length > 0 ?
                    branch.courts.map(court => court.rating).reduce((a, b) => a + b, 0) / branch.courts.length : 0
            }))
            let rating = branches.map(branch => branch.rating).reduce((a, b) => a + b, 0) / branches.length
            return ({
                ...venue,
                branches,
                rating
            })
        })
        return venues;
    }

    async getVenueById(venueId: number){
        const venue = await this.prisma.venue.findFirst({ 
            where:{
                id:venueId,
            },
            include:{
                branches:{
                    include:{
                        courts:true
                    }
                }
            }
        })
        let branches = venue?.branches.map(branch => ({
            ...branch,
            rating: branch.courts.length > 0 ?
                branch.courts.map(court => court.rating).reduce((a, b) => a + b, 0) / branch.courts.length : 0
        }))
        let rating = branches?.map(branch => branch.rating).reduce((a, b) => a + b, 0) / branches.length
        return ({
            ...venue,
            branches,
            rating
        })
    }

    async editVenue(venueId: number, dto:EditVenueDto){
        const user = await this.prisma.user.update({
            where:{
                id: venueId
            },
            data:{
                ...dto,
            }
        })

        delete user.hash;
        return user;
    } 
    
    async getBookingsInVenue(venueId: number, date: Date) {
        return this.prisma.game.findMany({
            where:{
                AND: [
                        { court: {
                            branch: {
                                venueId: venueId
                            }
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
    
    async getTimeSlotsInVenue(venueId: number) {
        return this.prisma.timeSlot.findMany({
            where: { courtTimeSlots: {
                        some: {
                            court: {
                                branch: {
                                    venueId: venueId
                                }
                            }
                        }
                    }
                },
            select: {
                id: true,
                startTime: true,
                endTime: true
            }
        })
    }
}
