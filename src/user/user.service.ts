import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditUserDto } from './dto/edit-user.dto';
import { ratePlayerDto } from './dto/rate-player-dto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService){}

    async getUsers(){
        const users = await this.prisma.user.findMany({
            select:{
                id: true,
                firstName:true,
                lastName: true,
                rating: true,
            }
         
        })
        
        return users;
    }

    async getUserById(userId: number){
        var user = await this.prisma.user.findFirst({
            where:{
                id: userId
            }
        })
        var rate = await this.prisma.playerRating.findMany({
            where: {
                playerId: userId
            },
            select: {
                performance: true,
                fairplay: true,
                teamPlayer: true,
                punctuality: true
            },
        });
        var ratingCategories = [0, 0, 0, 0];
        for (let i = 0; i < rate.length; i++){
            ratingCategories[0] += rate[i]['fairplay'];
            ratingCategories[1] += rate[i]['performance'];
            ratingCategories[2] += rate[i]['punctuality'];
            ratingCategories[3] += rate[i]['teamPlayer'];
        }
        user['rating'] = rate.length > 0 ? ratingCategories.reduce((a, b) => a + b, 0)/ (4 * rate.length): 0;
        user['faiplay'] = ratingCategories[0]/rate.length;
        user['performance'] = ratingCategories[1]/rate.length;
        user['punctuality'] = ratingCategories[2]/rate.length;
        user['teamPlayer'] = ratingCategories[3]/rate.length;
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
    async ratePlayer(userId: number, body: ratePlayerDto) {
        console.log(body);
        await this.prisma.playerRating.create({ data: {raterId: userId, ...body} });
    }
}
