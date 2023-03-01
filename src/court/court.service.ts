import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourtDto, EditCourtDto } from './dto';

@Injectable()
export class CourtService {
    constructor(private prisma:PrismaService){}

    getCourts(){
        return this.prisma.court.findMany({
            
        })

    }

    async getCourtById(courtId:number){
        const court = await this.prisma.court.findFirst({ 
            where:{
                id:courtId,                
            }
        })
        return court; 
    }

    async createCourt(dto: CreateCourtDto){
        const court = await this.prisma.court.create({ 
            data:{
                ...dto
            }
        })
        return court; 
    }

    async editCourtById(venueId: number, courtId:number, dto: EditCourtDto){
        const court = await this.prisma.court.findUnique({
            where:{
                id:courtId
            }
        })

        const branch = await this.prisma.branch.findFirst({
            where: {
                id: court.branchId,
            }
        })

        if(!branch || branch.venueId != venueId)
             throw new ForbiddenException("Access to edit denied")
        
             return this.prisma.court.update({
                where:{
                    id:courtId
                },
                data:{
                    ...dto
                }
             })
    }

    async deleteCourtById(venueId:number,courtId:number){
        const court = await this.prisma.court.findUnique({
            where:{
                id:courtId
            }
        })

        const branch = await this.prisma.branch.findFirst({
            where: {
                id: court.branchId,
            }
        })

        if(!branch || branch.venueId != venueId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.court.delete({
            where:{
                id:courtId
            }
        })
        
    }

}
