import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BranchService {
    constructor(private prisma: PrismaService) { }

    async getBranches() {

        const BranchesWithVenue = await this.prisma.branch.findMany({
            select: {
                location: true,
                rating: true,
                venue: true,
            }
       
        });

        return BranchesWithVenue;
    }

    async getBranchesById(branchId: number) {
        const branch = await this.prisma.branch.findFirst({
            where: {
                id: branchId,
            }
        })
        return branch;

    }
}
