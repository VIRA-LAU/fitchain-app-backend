import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto';
import { EditInvitationDto } from './dto/edit-invitation.dto';

@Injectable()
export class InvitetogameService {
    constructor(private prisma: PrismaService){}

    async getSentInvitations(userId:number){
        return this.prisma.inviteToGame.findMany({
            where:{
                userId
            },
            select:{
                team: true,
                friend:{
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

    async getReceivedInvitations(userId: number) {
        return this.prisma.inviteToGame.findMany({
            where:{
                friendId: userId
            },
            select:{
                team: true,
                friend:{
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


    async getSentInvitationById(userId: number, invitationId: number) {
        const sentInvitation = this.prisma.inviteToGame.findFirst({
            where:{
                id: invitationId,
                userId: userId
            }
        })

        return sentInvitation
    }

    async getReceivedInvitationById(userId:number, invitationId:number ){
        const receievdInvitation = this.prisma.inviteToGame.findFirst({
            where:{
                id: invitationId,
                friendId: userId
            }
        })

        return receievdInvitation;
    }

    async createInvitation(userId:number, dto:CreateInvitationDto){
        const invitation = await this.prisma.inviteToGame.create({ 
            data:{
                userId,
                ...dto
            }
        })
        return invitation; 
    }

    async editInvitationkById(userId:number,invitationId: number, dto:EditInvitationDto){
        const invitation = await this.prisma.inviteToGame.findUnique({
            where:{
                id:invitationId
            }
        })

        if(!invitation || invitation.userId != userId)
             throw new ForbiddenException("Access to edit denied")
        
             return this.prisma.inviteToGame.update({
                where:{
                    id:invitationId
                },
                data:{
                    ...dto
                }
             })
    }

    async deleteInvitationById(userId:number, invitationId:number){
        const invitation = await this.prisma.inviteToGame.findUnique({
            where:{
                id:invitationId
            }
        })

        if(!invitation || invitation.userId != userId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.inviteToGame.delete({
            where:{
                id:invitationId
            }
        })
        
    }

}
