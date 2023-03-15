import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestToJoinDto, EditRequestToJoinDto } from './dto';

@Injectable()
export class RequesttojoingameService {
    constructor(private prisma: PrismaService){}

    async getSentRequests(userId:number){
        return this.prisma.requestToJoinGame.findMany({
            where:{
                userId
            },
            select:{
                team: true,
                status:true,
                game:{
                    select:{
                        type:true,
                        date:true,
                        duration: true,
                        court:{
                            select:{
                                branch:{
                                    select:{
                                        location:true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    async getRecievedRequests(userId: number) {
        return this.prisma.requestToJoinGame.findMany({
            where:{
                game:{
                    adminId:userId
                }
            },
            select:{
                team: true,
                status:true,
                user:{
                    select:{
                        firstName:true,
                        lastName:true,
                    }
                },
                game:{
                    select:{
                        type:true,
                        date:true,
                        duration: true,
                        court:{
                            select:{
                                branch:{
                                    select:{
                                        location:true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    }


    async getSentRequestById(userId: number, requestId: number) {
        const sentRequest = this.prisma.requestToJoinGame.findFirst({
            where:{
                id: requestId,
                userId: userId
            }
        })

        return sentRequest
    }

    async getReceivedRequestById(userId:number, requestId:number ){
        const receivedRequest = this.prisma.requestToJoinGame.findFirst({
            where:{
                id: requestId,
                game:{
                    adminId:userId
                }
            }
        })

        return receivedRequest;
    }

    async createRequest(userId:number, dto:CreateRequestToJoinDto){
        const request = await this.prisma.requestToJoinGame.create({ 
            data:{
                userId,
                ...dto
            }
        })
        return request; 
    }

    async editRequestById(userId:number,requestId: number, dto:EditRequestToJoinDto){
        const request = await this.prisma.requestToJoinGame.findUnique({
            where:{
                id:requestId
            }
        })

        if(!request || request.userId != userId)
             throw new ForbiddenException("Access to edit denied")
        
             return this.prisma.requestToJoinGame.update({
                where:{
                    id:requestId
                },
                data:{
                    ...dto
                }
             })
    }

    async deleteRequestByGameId(userId:number, gameId:number){
        const request = await this.prisma.requestToJoinGame.findUnique({
            where:{
                userId_gameId: {
                    userId,
                    gameId
                }
            }
        })
        if(!request || request.userId != userId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.requestToJoinGame.delete({
            where:{
                userId_gameId: {
                    userId,
                    gameId
                }
            }
        })
    }

    async deleteRequestById(userId:number, requestId:number){
        const request = await this.prisma.requestToJoinGame.findUnique({
            where:{
                id:requestId
            }
        })

        if(!request || request.userId != userId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.requestToJoinGame.delete({
            where:{
                id:requestId
            }
        })
        
    }

}
