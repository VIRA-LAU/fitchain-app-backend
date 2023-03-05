import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    async getUsers(){
        const users = await this.prisma.user.findMany({
            select:{
                firstName:true,
                lastName: true,
                rating: true,
            }
         
        })
        
        return users;
    }

    async getUserById(userId: number){
        const user = await this.prisma.user.findFirst({
            where:{
                id: userId
            }
        })

        delete user.hash;
        return user;
    }

    async editUser(userId: number, dto: EditUserDto){
        const user = await this.prisma.user.update({
            where:{
                id: userId
            },
            data:{
                ...dto,
            }
        })

        delete user.hash;
        return user;
    }

    async deleteUserById(userId:number){
        const user = await this.prisma.user.findUnique({
            where:{
                id:userId
            }
        })

        if(!user || user.id != userId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.user.delete({
            where:{
                id:userId
            }
        })
        
    }
}
