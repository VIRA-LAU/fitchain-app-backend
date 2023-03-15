import { ForbiddenException, Injectable } from '@nestjs/common';
import { gameStatus, invitationApproval } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createBookingDto } from './dto/create-booking.dto';
import { createFollowGameDto } from './dto/create-follow-game.dto';
import { editBookingDto } from './dto/edit-booking.dto';

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService){}

    async getGames(userId: number, limit?: number, type?: string) {
        const whereClause = {
          AND: [
            {OR: [
                { adminId: userId },
                {
                gameInvitation: {
                    some: {
                    friendId: userId,
                    },
                },
                },
                {
                gameRequests: {
                    some: {
                    userId: userId,
                    },
                },
                },
            ],},
            type === 'upcoming' ? {
                date: {gt: new Date()}
            } : type === 'previous' ? {
                date: {lt: new Date()}
            } : {}]
        };
        const games = await this.prisma.game.findMany({
          where: whereClause,
          orderBy: type === 'upcoming' ? { date: 'asc' } : type === 'previous' ? { date: 'desc' } : undefined,
          take: limit?limit:undefined,
          select: {
            id: true,
            date: true,
            duration: true,
            adminTeam: true,
            type: true,
            court: {
              select: {
                courtType: true,
                branch: {
                  select: {
                    location: true,
                    venue: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            gameRequests: {
              select: {
                team: true,
              },
            },
            gameInvitation: {
              select: {
                team: true,
              },
            },
            admin: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
        return games;
      }
      

    async getGameById(gameId:number){
        const game = await this.prisma.game.findFirst({ 
            where:{
                id:gameId
            },
            select:{
                id: true,
                date:true,
                duration:true,
                type: true,
                adminTeam: true,
                court: {
                    select:{
                        courtType: true,
                        branch:{
                            select:{
                                location: true,
                                venue:{
                                    select:{
                                        name:true
                                    }
                                }
                                
                            }
                            
                        }
                    }
                },
                gameRequests:{
                    where:{
                        status: invitationApproval.APPROVED
                    },
                    select:{
                        team: true,
                        user:{
                            select:{
                                id:true
                            }
                        }
                    }
                },
                gameInvitation:{
                    where:{
                        status: invitationApproval.APPROVED
                    },
                    select:{
                        team: true,
                        friend:{
                            select:{
                                id:true
                            }
                        }
                    }
                },
                admin: {
                    select:{
                        id:true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })
        return game; 
    }

    async getBookings(type?: string) {
        return this.prisma.game.findMany({
            where:{
                AND: [
                    {OR: [
                        {status: gameStatus.APPROVED},
                        {status: gameStatus.FINISHED},  
                    ]},
                    type === 'upcoming' ? {
                        date: {gt: new Date()}
                    } : type === 'previous' ? {
                        date: {lt: new Date()}
                    } : {}]
                },
            orderBy: type === 'upcoming' ? { date: 'asc' } : type === 'previous' ? { date: 'desc' } : undefined,
            select:{
                id: true,
                date:true,
                duration:true,
                type: true,
                adminTeam: true,
                court: {
                    select:{
                        courtType: true,
                        branch:{
                            select:{
                                location: true,
                                venue:{
                                    select:{
                                        name:true
                                    }
                                }
                                
                            }
                            
                        }
                    }
                },
                gameRequests:{
                    where:{
                        status: invitationApproval.APPROVED
                    },
                    select:{
                        team: true,
                        user:{
                            select:{
                                id:true
                            }
                        }
                    }
                },
                gameInvitation:{
                    where:{
                        status: invitationApproval.APPROVED
                    },
                    select:{
                        team: true,
                        friend:{
                            select:{
                                id:true
                            }
                        }
                    }
                },
                admin: {
                    select:{
                        id:true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        })
    }
 
    async createBooking(userId: number, dto: createBookingDto){
        const booking = await this.prisma.game.create({ 
            data:{
                adminId: userId,
                status: 'APPROVED',
                ...dto
            }
        })
        return booking; 
    }

    async editBookingById(userId: number, bookingId:number, dto: editBookingDto){
        const booking = await this.prisma.game.findUnique({
            where:{
                id:bookingId
            }
        })

        if(!booking || booking.adminId != userId)
             throw new ForbiddenException("Access to edit denied")
        
             return this.prisma.game.update({
                where:{
                    id:bookingId
                },
                data:{
                    ...dto
                }
             })
    }

    async deleteBookingById(userId:number,bookingId:number){
        const booking = await this.prisma.game.findUnique({
            where:{
                id:bookingId
            }
        })

        if(!booking || booking.adminId != userId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.game.delete({
            where:{
                id:bookingId
            }
        })
        
    }

   

    async getFollowedGames(userId: number, type?: string) {
        return this.prisma.followsGame.findMany({
            where: {
                AND: [{
                userId:userId,
                }, type === 'upcoming' ? {
                game: {date: {gt: new Date()}}
                } : type === 'previous' ? {
                game: {date: {lt: new Date()}}
                } : {}
            ]},
            orderBy: type === 'upcoming' ? {game:{ date: 'asc' }} : type === 'previous' ? {game: { date: 'desc' }} : undefined,
           select:{
            game:{
                select:{
                    id: true,
                    date:true,
                    duration:true,
                    type: true,
                    adminTeam: true,
                    court: {
                        select:{
                            courtType: true,
                            branch:{
                                select:{
                                    location: true,
                                    venue:{
                                        select:{
                                            name:true
                                        }
                                    }
                                    
                                }
                                
                            }
                        }
                    },
                    gameRequests:{
                        where:{
                            status: invitationApproval.APPROVED
                        },
                        select:{
                            team: true,
                            user:{
                                select:{
                                    id:true
                                }
                            }
                        }
                    },
                    gameInvitation:{
                        where:{
                            status: invitationApproval.APPROVED
                        },
                        select:{
                            team: true,
                            friend:{
                                select:{
                                    id:true
                                }
                            }
                        }
                    },
                    admin: {
                        select:{
                            id:true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
           }
        })
    }


    async createFollowGame(userId: number, dto: createFollowGameDto) {
        return this.prisma.followsGame.create({
           data:{
            userId:userId,
            ...dto,
           }
        })
    }

    async deleteFollowById(userId: number, gameId: number) {
        const follow = await this.prisma.followsGame.findUnique({
            where:{
               userId_gameId:{userId,gameId}
            }
        })

        if(!follow || follow.userId != userId)
        throw new ForbiddenException("Access to edit denied")

        await this.prisma.followsGame.delete({
            where:{
                userId_gameId:{userId,gameId}
            }
        })
    }

    async getPlayerGameStatus(userId: number, gameId: number) {
        const gameStatus = await this.prisma.game.findFirst({
          where: {
            id: gameId,
          },
          include: {
            gameRequests: {
              where: {
                userId: userId,
              },
              select:{
                status:true,
              }
            },
            gameInvitation: {
              where: {
                friendId: userId,
              },
              select:{
                status:true,
              }
            },
          },
        });
    
        const userStatus = {
          hasRequestedtoJoin: gameStatus?.gameRequests?.length>0? gameStatus.gameRequests[0].status:false,
          hasBeenInvited: gameStatus?.gameInvitation?.length>0? gameStatus.gameInvitation[0].status:false,
          isAdmin: gameStatus.adminId === userId,
        };
        return userStatus;
      }
      

    async getActivities(userId: number) {
        const selectedFields = {
            id: true,
            date:true,
            type: true,
            winnerTeam: true
        }
        const adminActivities = (await this.prisma.game.findMany({ 
            where:{                
                AND: [
                    { adminId: userId },
                    {status: gameStatus.FINISHED}
                ],
            },
            select:{
                ...selectedFields,
                adminTeam: true,
            },
        })).map(({id, date, type, winnerTeam, adminTeam}) => ({
            gameId: id, date, type, isWinner: winnerTeam === adminTeam
        }))
        const invitedActivities = (await this.prisma.game.findMany({ 
            where:{
                AND: [{
                    gameInvitation: {
                        some: {
                        friendId: userId
                    }
                    }
                },
                    {status: gameStatus.FINISHED}
                ],
            },
            select:{
                ...selectedFields,
                gameInvitation: {
                    select: {
                        team: true,
                    },
                }

            },
        })).map(({id, date, type, winnerTeam, gameInvitation}) => ({
            gameId: id, date, type, isWinner: winnerTeam === gameInvitation.pop().team
        }))
        const requestedActivities = (await this.prisma.game.findMany({ 
            where:{
                AND: [
                    {
                        gameRequests: {
                            some: {
                                userId:userId
                            }
                    }},
                    {status: gameStatus.FINISHED}
                ],
            },
            select:{
                ...selectedFields,
                gameRequests: {
                    select: {
                        team: true,
                    }
                },
            },
        })).map(({id, date, type, winnerTeam, gameRequests}) => ({
            gameId: id, date, type, isWinner: winnerTeam === gameRequests.pop().team
        }))

        return [
            ...adminActivities,
            ...invitedActivities,
            ...requestedActivities
        ]; 
    }

    async getUpdates(gameId: number) {
        const activities = await this.prisma.game.findMany({ 
            where:{
               id:gameId
            },
            select:{
                date:true,
                duration:true,
                type: true,
                winnerTeam: true,
                adminTeam: true,
                status: true,
                highlights: true,
                gameInvitation: {
                    orderBy:{
                        createdAt:'desc'
                    },
                    take:5
                },
                gameRequests: {
                    orderBy:{
                        createdAt:'desc'
                    },
                    take:5
                }
            }
        })
        return activities; 
    }

    async getPlayers(gameId: number) {
        const admin = await this.prisma.game.findMany({
            where: {
                id: gameId
            }, 
            select: {
                admin: {
                    select: {
                        id: true,
                    }
                },
                adminTeam: true
            }
        });
        const requested = await this.prisma.game.findFirst({
            where: {
              id: gameId
            },
            select: {
              gameRequests: {
                select: {
                    userId: true,
                    team: true,
                    status: true,
                }
              }
            }
        });
        const invited = await this.prisma.game.findFirst({
            where: {
              id: gameId
            },
            select: {
              gameInvitation: {
                select: {
                    friendId: true,
                    team: true,
                    status: true,
                }
              }
            }
          });
            var players = admin.map(player => ({ id: player.admin.id, team: player.adminTeam, status: 'APPROVED' }));
            players = players.concat(requested.gameRequests.map(player => ({ id: player.userId, team: player.team, status: player.status })));     
            players = players.concat(invited.gameInvitation.map(player => ({ id: player.friendId, team: player.team, status: player.status })));        
            players = await Promise.all(players.map(async (player) => {
            const user = await this.prisma.user.findUnique({
              where: {
                id: player.id,
              },
              select: {
                firstName: true,
                lastName: true,
              },
            });
            return {
              ...player,
              firstName: user.firstName,
              lastName: user.lastName,
            };
          }));
        return players;
          
    }

}
