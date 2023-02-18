import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditVenueDto } from './dto';

@Injectable()
export class VenueService {
    constructor(private prisma: PrismaService){}

    async getVenues(){
        const venues = await this.prisma.venue.findMany()

        return venues;
    }

    async getVenueById(venueId: number){
        const venue = await this.prisma.venue.findFirst({ 
            where:{
                id:venueId,
            }
        })
        return venue; 

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
    

}
