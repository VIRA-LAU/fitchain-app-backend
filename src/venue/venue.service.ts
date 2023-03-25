import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditVenueDto } from './dto';

@Injectable()
export class VenueService {
    constructor(private prisma: PrismaService){}

    async getVenues(){

    const venuesWithBranches = await this.prisma.venue.findMany({
        select:{
            name: true,
            branches:{
                select:{
                    location:true,
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
            },
            include:{
                branches:{
                    include:{
                        courts:true
                    }
                }
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
