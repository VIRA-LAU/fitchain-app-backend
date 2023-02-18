import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VenueService {
    constructor(private prisma: PrismaService){}

    async getVenues(){
        const venues = await this.prisma.venue.findMany()

        return venues;
    }
}
