import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFriendRequestDto, EditFriendRequestDto } from './dto';

@Injectable()
export class AddfriendService {
    constructor(private prisma: PrismaService){}

    async getSentRequests(userId:number){
        return this.prisma.addFriend.findMany({
            where:{
                userId:userId
            },
            select:{
                friendId:true,
                status: true,
            }
        })
    }

    async getRecievedRequests(userId: number) {
        return this.prisma.addFriend.findMany({
            where:{
                friendId:userId
            },
            select:{
                user:{
                    select:{
                        firstName:true,
                        lastName:true,
                    }
                },
                status:true,
            }
        })
    }


    async getSentRequestById(userId: number, requestId: number) {
        const sentRequest = this.prisma.addFriend.findFirst({
            where:{
                id: requestId,
                userId: userId
            }
        })

        return sentRequest
    }

    async getReceivedRequestById(userId:number, requestId:number ){
        const receivedRequest = this.prisma.addFriend.findFirst({
            where:{
                id: requestId,
                friendId:userId
            }
        })

        return receivedRequest;
    }

    async createRequest(userId:number, dto:CreateFriendRequestDto){
        const request = await this.prisma.addFriend.create({ 
            data:{
                userId,
                ...dto
            }
        })
        return request; 
    }

    async editRequestById(userId:number,requestId: number, dto:EditFriendRequestDto){
        const request = await this.prisma.addFriend.findUnique({
            where:{
                id:requestId
            }
        })

        if(!request || request.userId != userId)
             throw new ForbiddenException("Access to edit denied")
        
             return this.prisma.addFriend.update({
                where:{
                    id:requestId
                },
                data:{
                    ...dto
                }
             })
    }

    async deleteRequestById(userId:number, requestId:number){
        const request = await this.prisma.addFriend.findUnique({
            where:{
                id:requestId
            }
        })

        if(!request || request.userId != userId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.addFriend.delete({
            where:{
                id:requestId
            }
        })
        
    }

}
