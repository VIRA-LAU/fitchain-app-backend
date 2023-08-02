import { ForbiddenException, Injectable } from '@nestjs/common';
import { gameStatus, gameType, invitationApproval } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createBookingDto } from './dto/create-booking.dto';
import { createFollowGameDto } from './dto/create-follow-game.dto';
import { editBookingDto } from './dto/edit-booking.dto';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async getGames(userId: number, limit?: number, type?: string) {
    const whereClause = {
      AND: [
        {
          OR: [
            { adminId: userId },
            {
              gameInvitation: {
                some: {
                  AND: [
                    { friendId: userId },
                    {
                      NOT: {
                        status: invitationApproval.REJECTED,
                      },
                    },
                  ],
                },
              },
            },
            {
              gameRequests: {
                some: {
                  AND: [
                    { userId },
                    {
                      NOT: {
                        status: invitationApproval.REJECTED,
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        type === 'upcoming'
          ? {
              endTime: { gt: new Date() },
            }
          : type === 'previous'
          ? {
              endTime: { lt: new Date() },
            }
          : {},
      ],
    };
    const games = await this.prisma.game.findMany({
      where: whereClause,
      orderBy:
        type === 'upcoming'
          ? { startTime: 'asc' }
          : type === 'previous'
          ? { startTime: 'desc' }
          : undefined,
      take: limit ? limit : undefined,
      select: {
        id: true,
        adminTeam: true,
        startTime: true,
        endTime: true,
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
    return games;
  }

  async getPlayerTeam(userId: number, gameID: string) {
    let gameId = parseInt(gameID);
    const game = await this.prisma.game.findFirst({
      where: {
        id: {
          equals: gameId,
        },
      },
    });
    if (game.adminId == userId) return { team: game.adminTeam };

    const requested = await this.prisma.game.findFirst({
      where: {
        id: gameId,
      },
      select: {
        gameRequests: {
          select: {
            userId: true,
            team: true,
          },
        },
      },
    });
    for (let i = 0; i < requested['gameRequests'].length; i++) {
      if (requested['gameRequests'][i]['userId'] === userId) {
        return {
          team: requested['gameRequests'][i]['team'],
        };
      }
    }
    const invited = await this.prisma.game.findFirst({
      where: {
        id: gameId,
      },
      select: {
        gameInvitation: {
          select: {
            friendId: true,
            team: true,
            status: true,
          },
        },
      },
    });
    for (let i = 0; i < invited['gameInvitation'].length; i++) {
      if (invited['gameInvitation'][i]['friendId'] === userId) {
        return {
          team: invited['gameInvitation'][i]['team'],
        };
      }
    }

    return { team: 'none' };
  }

  async searchGames(
    userId: number,
    gameType: gameType,
    nbOfPlayers: number,
    dateStr?: string,
    startTimeStr?: string,
    endTimeStr?: string,
  ) {
    const date = dateStr ? new Date(dateStr) : undefined;
    var startTime: Date = undefined;
    var endTime: Date = undefined;

    if (startTimeStr && endTimeStr) {
      startTime = new Date(dateStr);
      startTime.setHours(
        new Date(startTimeStr).getHours(),
        new Date(startTimeStr).getMinutes(),
        0,
        0,
      );
      endTime = new Date(dateStr);
      endTime.setHours(
        new Date(endTimeStr).getHours(),
        new Date(endTimeStr).getMinutes(),
        0,
        0,
      );
    }

    const games = await this.prisma.game.findMany({
      where: {
        AND: [
          { type: gameType },
          { NOT: { adminId: userId } },
          {
            startTime: date
              ? {
                  gte: date,
                  lte: new Date(date.getTime() + 24 * 60 * 60 * 1000),
                }
              : { gt: new Date() },
          },
          startTime
            ? {
                startTime: { lte: startTime },
              }
            : {},
          endTime
            ? {
                endTime: { gte: endTime },
              }
            : {},
        ],
      },
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        adminTeam: true,
        startTime: true,
        endTime: true,
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
    const filteredGames = [];
    for (const game of games) {
      const requestsInGame = await this.prisma.requestToJoinGame.count({
        where: {
          gameId: game.id,
          status: 'APPROVED',
        },
      });
      const invitationsInGame = await this.prisma.inviteToGame.count({
        where: {
          gameId: game.id,
          status: 'APPROVED',
        },
      });
      if (
        game.court.nbOfPlayers - requestsInGame - invitationsInGame - 1 >=
        nbOfPlayers
      )
        filteredGames.push(game);
    }
    return filteredGames;
  }

  async getGameById(gameId: number) {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
      },
      select: {
        id: true,
        type: true,
        adminTeam: true,
        startTime: true,
        endTime: true,
        homeScore: true,
        awayScore: true,
        winnerTeam: true,
        court: {
          include: {
            branch: {
              select: {
                location: true,
                latitude: true,
                longitude: true,
                profilePhotoUrl: true,
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
          where: {
            status: invitationApproval.APPROVED,
          },
          select: {
            team: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        gameInvitation: {
          where: {
            status: invitationApproval.APPROVED,
          },
          select: {
            team: true,
            friend: {
              select: {
                id: true,
              },
            },
          },
        },
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        isRecording: true,
      },
    });
    return game;
  }

  async getBookings(type?: string) {
    return this.prisma.game.findMany({
      where: {
        AND: [
          { status: gameStatus.APPROVED },
          type === 'upcoming'
            ? {
                endTime: { gt: new Date() },
              }
            : type === 'previous'
            ? {
                endTime: { lt: new Date() },
              }
            : {},
        ],
      },
      orderBy:
        type === 'upcoming'
          ? { startTime: 'asc' }
          : type === 'previous'
          ? { startTime: 'desc' }
          : undefined,
      select: {
        id: true,
        type: true,
        adminTeam: true,
        startTime: true,
        endTime: true,
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
          where: {
            status: invitationApproval.APPROVED,
          },
          select: {
            team: true,
            user: {
              select: {
                id: true,
              },
            },
          },
        },
        gameInvitation: {
          where: {
            status: invitationApproval.APPROVED,
          },
          select: {
            team: true,
            friend: {
              select: {
                id: true,
              },
            },
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
  }

  async createBooking(userId: number, dto: createBookingDto) {
    const booking = await this.prisma.game.create({
      data: {
        adminId: userId,
        status: 'APPROVED',
        ...dto,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      },
    });
    return booking;
  }

  async editBookingById(
    userId: number,
    bookingId: number,
    dto: editBookingDto,
  ) {
    const booking = await this.prisma.game.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking || booking.adminId != userId)
      throw new ForbiddenException('Access to edit denied');

    if (
      typeof dto.homeScore !== 'undefined' &&
      typeof dto.awayScore !== 'undefined'
    ) {
      let newWinner =
        dto.homeScore === dto.awayScore
          ? 'DRAW'
          : dto.homeScore > dto.awayScore
          ? 'HOME'
          : 'AWAY';
      dto['winnerTeam'] = newWinner;
    }

    if (dto.recordingMode) {
      dto['isRecording'] = dto.recordingMode === 'start';
      delete dto.recordingMode;
    }

    return this.prisma.game.update({
      where: {
        id: bookingId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookingById(userId: number, bookingId: number) {
    const booking = await this.prisma.game.findUnique({
      where: {
        id: bookingId,
      },
    });

    if (!booking || booking.adminId != userId)
      throw new ForbiddenException('Access to edit denied');

    await this.prisma.game.delete({
      where: {
        id: bookingId,
      },
    });
  }

  async getFollowedGames(userId: number, type?: string) {
    return this.prisma.followsGame.findMany({
      where: {
        AND: [
          {
            userId: userId,
          },
          type === 'upcoming'
            ? {
                game: {
                  endTime: { gt: new Date() },
                },
              }
            : type === 'previous'
            ? {
                game: {
                  endTime: { lt: new Date() },
                },
              }
            : {},
        ],
      },
      orderBy:
        type === 'upcoming'
          ? { game: { startTime: 'asc' } }
          : type === 'previous'
          ? { game: { startTime: 'desc' } }
          : undefined,
      select: {
        game: {
          select: {
            id: true,
            type: true,
            adminTeam: true,
            startTime: true,
            endTime: true,
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
              where: {
                status: invitationApproval.APPROVED,
              },
              select: {
                team: true,
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            gameInvitation: {
              where: {
                status: invitationApproval.APPROVED,
              },
              select: {
                team: true,
                friend: {
                  select: {
                    id: true,
                  },
                },
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
        },
      },
    });
  }

  async createFollowGame(userId: number, dto: createFollowGameDto) {
    return this.prisma.followsGame.create({
      data: {
        userId: userId,
        ...dto,
      },
    });
  }

  async deleteFollowById(userId: number, gameId: number) {
    const follow = await this.prisma.followsGame.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });

    if (!follow || follow.userId != userId)
      throw new ForbiddenException('Access to edit denied');

    await this.prisma.followsGame.delete({
      where: {
        userId_gameId: { userId, gameId },
      },
    });
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
          select: {
            status: true,
            id: true,
            updatedAt: true,
          },
        },
        gameInvitation: {
          where: {
            friendId: userId,
          },
          select: {
            status: true,
            id: true,
            updatedAt: true,
          },
        },
      },
    });
    gameStatus.gameInvitation.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
    gameStatus.gameRequests.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
    const userStatus = {
      hasRequestedtoJoin:
        gameStatus?.gameRequests?.length > 0
          ? gameStatus.gameRequests[0].status
          : false,
      hasBeenInvited:
        gameStatus?.gameInvitation?.length > 0
          ? gameStatus.gameInvitation[0].status
          : false,
      requestId:
        gameStatus?.gameRequests?.length > 0
          ? gameStatus.gameRequests[0].id
          : false,
      invitationId:
        gameStatus?.gameInvitation?.length > 0
          ? gameStatus.gameInvitation[0].id
          : false,
      isAdmin: gameStatus.adminId === userId,
    };
    return userStatus;
  }

  async getActivities(userId: number) {
    const selectedFields = {
      id: true,
      type: true,
      winnerTeam: true,
      startTime: true,
      endTime: true,
    };
    const adminActivities = (
      await this.prisma.game.findMany({
        where: {
          AND: [{ adminId: userId }, { endTime: { lte: new Date() } }],
        },
        select: {
          ...selectedFields,
          adminTeam: true,
        },
      })
    ).map(({ id, startTime, endTime, type, winnerTeam, adminTeam }) => ({
      gameId: id,
      startTime,
      endTime,
      type,
      isWinner: winnerTeam === 'DRAW' ? 'DRAW' : winnerTeam === adminTeam,
    }));
    const invitedActivities = (
      await this.prisma.game.findMany({
        where: {
          AND: [
            {
              gameInvitation: {
                some: {
                  friendId: userId,
                },
              },
            },
            { endTime: { lte: new Date() } },
          ],
        },
        select: {
          ...selectedFields,
          gameInvitation: {
            select: {
              team: true,
            },
          },
        },
      })
    ).map(({ id, startTime, endTime, type, winnerTeam, gameInvitation }) => ({
      gameId: id,
      startTime,
      endTime,
      type,
      isWinner:
        winnerTeam === 'DRAW'
          ? 'DRAW'
          : winnerTeam === gameInvitation.pop().team,
    }));
    const requestedActivities = (
      await this.prisma.game.findMany({
        where: {
          AND: [
            {
              gameRequests: {
                some: {
                  userId: userId,
                },
              },
            },
            { endTime: { lte: new Date() } },
          ],
        },
        select: {
          ...selectedFields,
          gameRequests: {
            select: {
              team: true,
            },
          },
        },
      })
    ).map(({ id, startTime, endTime, type, winnerTeam, gameRequests }) => ({
      gameId: id,
      startTime,
      endTime,
      type,
      isWinner:
        winnerTeam === 'DRAW' ? 'DRAW' : winnerTeam === gameRequests.pop().team,
    }));

    return [...adminActivities, ...invitedActivities, ...requestedActivities];
  }

  async getGameCount(userId: number) {
    const adminGameCount = await this.prisma.game.count({
      where: {
        AND: [{ endTime: { lte: new Date() } }, { adminId: userId }],
      },
    });
    const invitedGameCount = await this.prisma.inviteToGame.count({
      where: {
        AND: [
          {
            game: { endTime: { lte: new Date() } },
            status: 'APPROVED',
          },
          { friendId: userId },
        ],
      },
    });
    const requestedGameCount = await this.prisma.requestToJoinGame.count({
      where: {
        AND: [
          {
            game: { endTime: { lte: new Date() } },
            status: 'APPROVED',
          },
          { userId },
        ],
      },
    });
    return adminGameCount + invitedGameCount + requestedGameCount;
  }

  async getUpdates(gameId: number) {
    const updates = await this.prisma.game.findUnique({
      where: {
        id: gameId,
      },
      select: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        createdAt: true,
        winnerTeam: true,
        status: true,
        gameInvitation: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          select: {
            createdAt: true,
            status: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhotoUrl: true,
              },
            },
            friend: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
        gameRequests: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            status: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePhotoUrl: true,
              },
            },
          },
        },
      },
    });
    return updates;
  }

  async getPlayers(gameId: number, userId: number) {
    const game = await this.prisma.game.findUnique({
      where: {
        id: gameId,
      },
      select: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
            coverPhotoUrl: true,
          },
        },
        updatedAt: true,
        adminTeam: true,
        gameRequests: {
          select: {
            userId: true,
            team: true,
            status: true,
            updatedAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                profilePhotoUrl: true,
                coverPhotoUrl: true,
              },
            },
          },
        },
        gameInvitation: {
          select: {
            friendId: true,
            team: true,
            status: true,
            updatedAt: true,
            friend: {
              select: {
                firstName: true,
                lastName: true,
                profilePhotoUrl: true,
                coverPhotoUrl: true,
              },
            },
          },
        },
      },
    });

    var players = [
      {
        id: game.admin.id,
        team: game.adminTeam,
        status: 'APPROVED',
        firstName: game.admin.firstName,
        lastName: game.admin.lastName,
        profilePhotoUrl: game.admin.profilePhotoUrl,
        coverPhotoUrl: game.admin.coverPhotoUrl,
        updatedAt: game.updatedAt,
      },
    ];
    players = players.concat(
      game.gameRequests.map((request) => ({
        id: request.userId,
        team: request.team,
        status: request.status,
        firstName: request.user.firstName,
        lastName: request.user.lastName,
        profilePhotoUrl: request.user.profilePhotoUrl,
        coverPhotoUrl: request.user.coverPhotoUrl,
        updatedAt: request.updatedAt,
      })),
    );
    players = players.concat(
      game.gameInvitation.map((invitation) => ({
        id: invitation.friendId,
        team: invitation.team,
        status: invitation.status,
        firstName: invitation.friend.firstName,
        lastName: invitation.friend.lastName,
        profilePhotoUrl: invitation.friend.profilePhotoUrl,
        coverPhotoUrl: invitation.friend.coverPhotoUrl,
        updatedAt: invitation.updatedAt,
      })),
    );

    players = players
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .filter(
        (player, index) =>
          players.findIndex((user) => user.id === player.id) === index,
      )
      .reverse();

    players = await Promise.all(
      players.map(async (player) => {
        const rate = await this.prisma.playerRating.findMany({
          where: {
            raterId: userId,
            gameId: gameId,
            playerId: player.id,
          },
          select: {
            raterId: true,
          },
        });
        return {
          ...player,
          rated: rate.length >= 1,
        };
      }),
    );

    players = await Promise.all(
      players.map(async (player) => {
        const rate = await this.prisma.playerRating.findMany({
          where: {
            playerId: player.id,
          },
          select: {
            performance: true,
            fairplay: true,
            teamPlayer: true,
            punctuality: true,
          },
        });
        var overallRating = 0;
        for (let i = 0; i < rate.length; i++) {
          overallRating =
            (rate[i]['fairplay'] +
              rate[i]['performance'] +
              rate[i]['punctuality'] +
              rate[i]['teamPlayer']) /
            4;
        }
        if (rate.length > 0) {
          overallRating /= rate.length;
        }
        return {
          ...player,
          rating: overallRating,
        };
      }),
    );
    return players;
  }
}
