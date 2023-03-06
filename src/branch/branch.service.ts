import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, EditBranchDto } from './dto';

@Injectable()
export class BranchService {
    constructor(private prisma: PrismaService) { }

    async getBranches() {

        const BranchesWithVenue = await this.prisma.branch.findMany({
            select: {
                location: true,
                rating: true,
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
                        price: true
                    }
                }
            }
       
        });

        return BranchesWithVenue;
    }

    async getBranchById(branchId: number) {
        const branch = await this.prisma.branch.findFirst({
            where: {
                id: branchId,
            }
        })
        return branch;

    }

    async getBranchesByVenueId(venueId: number) {
        const branches = await this.prisma.branch.findMany({
            where: {
                venueId,
            }
        })
        return branches;

    }

    async createBranch(venueId: number, dto: CreateBranchDto){
        const branch = await this.prisma.branch.create({ 
            data:{
                venueId: venueId,
                ...dto
            }
        })
        return branch; 
    }

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
