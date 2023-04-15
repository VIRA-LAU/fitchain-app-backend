import { ForbiddenException, Injectable } from '@nestjs/common';
import { gameStatus, gameType, invitationApproval, teamType, winnerTeamType } from '@prisma/client';
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
                        AND: [
                            {friendId: userId},
                            {NOT: {status: invitationApproval.REJECTED}}
                        ]
                    },
                },
                },
                {
                gameRequests: {
                    some: {
                        AND: [
                            {userId},
                            {NOT: {status: invitationApproval.REJECTED}}
                        ]
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
            adminTeam: true,
            gameTimeSlots: {
                select: {
                    timeSlot: true
                }
              },
              homeScore: true,
              awayScore: true,
            winnerTeam: true,
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
    async getPlayerTeam(userId: number, gameID: string) {
        let gameId=  parseInt(gameID)
        const game = await this.prisma.game.findFirst({
            where: {
                id: {
                equals: gameId
            }
        }});
        if (game.adminId == userId) return { "team": game.adminTeam };

        const requested = await this.prisma.game.findFirst({
            where: {
              id: gameId
            },
            select: {
              gameRequests: {
                select: {
                    userId: true,
                    team: true,
                }
              }
            }
        });
        for (let i = 0; i < requested['gameRequests'].length; i++){
            if (requested['gameRequests'][i]['userId'] === userId) {
                return { "team": requested['gameRequests'][i]['team'] }
            }
        }
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
        for (let i = 0; i < invited['gameInvitation'].length; i++){
            if (invited['gameInvitation'][i]['friendId'] === userId) {
                return { "team": invited['gameInvitation'][i]['team'] }
            }
        }

        return { "team": "none" };
    }

    async searchGames(userId: number, gameType: gameType, nbOfPlayers: number,
    date?: string, startTime?: string, endTime?: string) {
        const games = await this.prisma.game.findMany({
          where: {
            AND: [
                { type: gameType },
                { NOT: { adminId: userId } },
                { date: date ? {
                    gte: new Date(date),
                    lte: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
                } : { gt: new Date() } },
                startTime ? { gameTimeSlots: { some: { timeSlot: { startTime: {lte: startTime} } } } } : {},
                endTime ? { gameTimeSlots: { some: { timeSlot: { endTime: {gte: endTime} } } } } : {},
            ]
          },
          orderBy: { date: 'asc' },
          select: {
            id: true,
            date: true,
            adminTeam: true,
            gameTimeSlots: {
                select: {
                    timeSlot: true
                }
            },
            type: true,
            court: {
              select: {
                courtType: true,
                nbOfPlayers: true,
                branch: {
                  select: {
                    location: true,
                    latitude: true,
                    longitude: true,
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
        const filteredGames = []
        for (const game of games){
            const requestsInGame = await this.prisma.requestToJoinGame.count({
                where: {
                    gameId: game.id,
                    status: 'APPROVED'
                }
            })
            const invitationsInGame = await this.prisma.inviteToGame.count({
                where: {
                    gameId: game.id,
                    status: 'APPROVED'
                }
            })
            if (game.court.nbOfPlayers - requestsInGame - invitationsInGame - 1 >= nbOfPlayers)
                filteredGames.push(game)
        }
        return filteredGames;
    }

    async getGameById(gameId:number){
        const game = await this.prisma.game.findFirst({ 
            where:{
                id:gameId
            },
            select:{
                id: true,
                date:true,
                type: true,
                adminTeam: true,
                gameTimeSlots: {
                    select: {
                        timeSlot: true
                    }
                },
                homeScore: true,
                awayScore: true,
                winnerTeam: true,
                court: {
                    select:{
                        courtType: true,
                        branch:{
                            select:{
                                location: true,
                                latitude: true,
                                longitude: true,
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
                },
                isRecording: true
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
                    ], },
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
                type: true,
                adminTeam: true,
                gameTimeSlots: {
                    select: {
                        timeSlot: true
                    }
                },
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
        const timeSlots = await this.prisma.timeSlot.findMany({
            where: {
                id: { in: dto.timeSlotIds}
            },
            select: {
                id: true,
                startTime: true
            }
        })
        const dateStr = new Date(dto.date).toISOString()
        const bookingDate = new Date(`${dateStr.substring(0, dateStr.indexOf('T'))} ${timeSlots[0].startTime}`)
        const { timeSlotIds, ...dtoData } = dto
        const booking = await this.prisma.game.create({ 
            data:{
                adminId: userId,
                status: 'APPROVED',
                ...dtoData,
                date: bookingDate,

                gameTimeSlots: {
                    create: timeSlots.map(slot => ({timeSlotId: slot.id}))
                }
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
        
        if (dto.homeScore && dto.awayScore) {
            let newWinner = dto.homeScore === dto.awayScore ? 'DRAW' :
                dto.homeScore > dto.awayScore ? 'HOME' : 'AWAY'
            dto["winnerTeam"] = newWinner
        }

        if (dto.recordingMode) {
            dto["isRecording"] = dto.recordingMode === 'start'
            delete dto.recordingMode
        }

        return this.prisma.game.update({
            where:{
                id:bookingId
            },
            data:{
                ...dto,
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
                    type: true,
                    adminTeam: true,
                    gameTimeSlots: {
                        select: {
                            timeSlot: true
                        }
                    },
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
                id: true
              }
            },
            gameInvitation: {
              where: {
                friendId: userId,
              },
              select:{
                status:true,
                id: true
              }
            },
          },
        });
    
        const userStatus = {
          hasRequestedtoJoin: gameStatus?.gameRequests?.length > 0 ? gameStatus.gameRequests[0].status : false,
          hasBeenInvited: gameStatus?.gameInvitation?.length > 0 ? gameStatus.gameInvitation[0].status : false,
          requestId: gameStatus?.gameRequests?.length > 0 ? gameStatus.gameRequests[0].id : false,
          invitationId: gameStatus?.gameInvitation?.length > 0 ? gameStatus.gameInvitation[0].id : false,
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

    async getGameCount(userId: number) {
        const adminGameCount = await this.prisma.game.count({
            where: {
                AND: [
                        {date: {lte: new Date()}},
                        {adminId: userId}
                    ]
                },
            }
        )
        const invitedGameCount = await this.prisma.inviteToGame.count({
            where: {
                AND: [
                        {game: {date: {lte: new Date()}}},
                        {friendId: userId}
                    ]
                },
            }
        )
        const requestedGameCount = await this.prisma.requestToJoinGame.count({
            where: {
                AND: [
                    {game: {date: {lte: new Date()}}},
                    {userId}
                    ]
                },
            }
        )
        return adminGameCount + invitedGameCount + requestedGameCount
    }

    async getUpdates(gameId: number) {
        const updates = await this.prisma.game.findUnique({ 
            where:{
               id:gameId
            },
            select:{
                admin: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                createdAt: true,
                winnerTeam: true,
                status: true,
                gameInvitation: {
                    orderBy:{
                        createdAt:'desc'
                    },
                    take:5,
                    select: {
                        createdAt: true,
                        status: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        },
                        friend: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                gameRequests: {
                    orderBy:{
                        createdAt:'desc'
                    },
                    take:5,
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                        user: {
                            select: {
                                firstName: true,
                                lastName: true
                            }
                        },
                    }
                }
            }
        })
        return updates; 
    }

    async getPlayers(gameId: number, userId: number) {
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
        
            players = await Promise.all(players.map(async (player) => {
                const rate = await this.prisma.playerRating.findMany({
                  where: {
                        raterId: userId,
                        gameId: gameId,
                      playerId: player.id
                  },
                  select: {
                      raterId: true,
                  },
                });
            return {
              ...player,
                rated: rate.length >= 1 ? true : false
            };
            }));
            players = await Promise.all(players.map(async (player) => {
                const rate = await this.prisma.playerRating.findMany({
                  where: {
                      playerId: player.id
                  },
                  select: {
                      performance: true,
                      fairplay: true,
                      teamPlayer: true,
                      punctuality: true
                  },
                });
                var overallRating = 0;
                for (let i = 0; i < rate.length; i++){
                    overallRating = (rate[i]['fairplay'] + rate[i]['performance'] + rate[i]['punctuality'] + rate[i]['teamPlayer']) / 4;
                }
                if (rate.length > 0) { overallRating /= rate.length; }
            return {
              ...player,
                rating: overallRating,
            };
            }));
        return players; 
    }

}
