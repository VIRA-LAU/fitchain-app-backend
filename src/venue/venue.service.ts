import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditVenueDto } from './dto';

@Injectable()
export class VenueService {
    constructor(private prisma: PrismaService){}

    async getVenues(){

    const venuesWithBranches = await this.prisma.venue.findMany({
        select:{
            id: true,
            name: true,
            managerEmail: true,
            managerPhoneNumber: true,
            managerFirstName: true,
            managerLastName: true,
            branches:{
                select:{
                    id:true
                }
            }
        }
       
    });

            return venuesWithBranches;
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
