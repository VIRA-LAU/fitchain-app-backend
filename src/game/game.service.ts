import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { GameStatus, GameType, InvitationApproval } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createBookingDto, editBookingDto } from './dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AWSS3Service } from 'src/aws-s3/aws-s3.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private config: ConfigService,
    private s3: AWSS3Service,
  ) {}

  async getGames(userId: number, limit?: number, type?: string) {
    const games = await this.prisma.game.findMany({
      where: {
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
                          status: InvitationApproval.REJECTED,
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
                          status: InvitationApproval.REJECTED,
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
      },
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

  async getPlayerTeam(userId: number, gameId: number) {
    const game = await this.prisma.game.findFirst({
      where: {
        id: gameId,
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
    gameType: GameType,
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
        homePoints: true,
        homePossession: true,
        updatedHomePoints: true,
        awayPoints: true,
        awayPossession: true,
        updatedAwayPoints: true,
        highlights: true,
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
            status: InvitationApproval.APPROVED,
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
            status: InvitationApproval.APPROVED,
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
    const playersStatistics = await this.prisma.playerStatistics.findMany({
      where: {
        gameId,
      },
      include: {
        user: true,
      },
    });

    return { ...game, playersStatistics };
  }

  async getBookings(type?: string) {
    return await this.prisma.game.findMany({
      where: {
        AND: [
          { status: GameStatus.APPROVED },
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
            status: InvitationApproval.APPROVED,
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
            status: InvitationApproval.APPROVED,
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
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    const existingBooking = dto.courtId
      ? await this.prisma.game.findFirst({
          where: {
            OR: [
              {
                startTime: { lte: startTime },
                endTime: { gte: endTime },
              },
              {
                startTime: { gte: startTime },
                endTime: { lte: endTime },
              },
              {
                AND: [
                  { startTime: { lte: startTime } },
                  { endTime: { lte: endTime } },
                  { endTime: { gt: startTime } },
                ],
              },
              {
                AND: [
                  { startTime: { gte: startTime } },
                  { startTime: { lt: endTime } },
                  { endTime: { gte: endTime } },
                ],
              },
            ],
            courtId: dto.courtId,
          },
        })
      : undefined;
    if (!existingBooking) {
      const booking = await this.prisma.game.create({
        data: {
          adminId: userId,
          status: GameStatus.APPROVED,
          ...dto,
          startTime,
          endTime,
        },
      });
      return booking;
    } else throw new BadRequestException('EXISTING_GAME_OVERLAP');
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

    if (dto.recordingMode) {
      dto['isRecording'] = dto.recordingMode === 'start';
      delete dto.recordingMode;
    }

    return this.prisma.game.update({
      where: {
        id: bookingId,
      },
      data: dto,
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
                status: InvitationApproval.APPROVED,
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
                status: InvitationApproval.APPROVED,
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

  async createFollowGame(userId: number, gameId: number) {
    return this.prisma.followsGame.create({
      data: {
        userId,
        gameId,
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
      startTime: true,
      endTime: true,
      homePoints: true,
      homePossession: true,
      updatedHomePoints: true,
      awayPoints: true,
      awayPossession: true,
      updatedAwayPoints: true,
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
    ).map(
      ({
        id,
        startTime,
        endTime,
        type,
        adminTeam,
        updatedHomePoints,
        updatedAwayPoints,
      }) => ({
        gameId: id,
        startTime,
        endTime,
        type,
        isWinner:
          updatedHomePoints === updatedAwayPoints
            ? 'DRAW'
            : adminTeam === 'HOME' && updatedHomePoints > updatedAwayPoints,
      }),
    );
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
    ).map(
      ({
        id,
        startTime,
        endTime,
        type,
        updatedHomePoints,
        updatedAwayPoints,
        gameInvitation,
      }) => ({
        gameId: id,
        startTime,
        endTime,
        type,
        isWinner:
          updatedHomePoints === updatedAwayPoints
            ? 'DRAW'
            : gameInvitation.pop().team === 'HOME' &&
              updatedHomePoints > updatedAwayPoints,
      }),
    );
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
    ).map(
      ({
        id,
        startTime,
        endTime,
        type,
        updatedHomePoints,
        updatedAwayPoints,
        gameRequests,
      }) => ({
        gameId: id,
        startTime,
        endTime,
        type,
        isWinner:
          updatedHomePoints === updatedAwayPoints
            ? 'DRAW'
            : gameRequests.pop().team === 'HOME' &&
              updatedHomePoints > updatedAwayPoints,
      }),
    );

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
    var updates = await this.prisma.game.findUnique({
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
        status: true,
        endTime: true,
        gameInvitation: {
          where: {
            OR: [
              {
                game: {
                  endTime: {
                    gt: new Date(),
                  },
                },
              },
              {
                game: {
                  endTime: {
                    lte: new Date(),
                  },
                },
                status: InvitationApproval.APPROVED,
              },
            ],
          },
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
          where: {
            OR: [
              {
                game: {
                  endTime: {
                    gt: new Date(),
                  },
                },
              },
              {
                game: {
                  endTime: {
                    lte: new Date(),
                  },
                },
                status: InvitationApproval.APPROVED,
              },
            ],
          },
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

  async getPlayers(gameId: number, userId?: number) {
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
            notificationsToken: true,
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
                notificationsToken: true,
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
                notificationsToken: true,
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
        notificationsToken: game.admin.notificationsToken,
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
        notificationsToken: request.user.notificationsToken,
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
        notificationsToken: invitation.friend.notificationsToken,
      })),
    );

    players = players
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .filter(
        (player, index) =>
          players.findIndex((user) => user.id === player.id) === index,
      )
      .reverse();

    if (userId) {
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
              defense: true,
              offense: true,
              general: true,
              skill: true,
              teamplay: true,
              punctuality: true,
            },
          });
          var overallRating = 0;
          for (let i = 0; i < rate.length; i++) {
            overallRating =
              (rate[i]['defense'] +
                rate[i]['offense'] +
                rate[i]['general'] +
                rate[i]['skill'] +
                rate[i]['teamplay'] +
                rate[i]['punctuality']) /
              6;
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
    }

    return players;
  }

  async assignPlayerScore(playerStatisticsId: number, userId: number) {
    await this.prisma.playerStatistics.update({
      where: {
        id: playerStatisticsId,
      },
      data: {
        userId,
      },
    });

    return 'success';
  }

  async uploadVideo(gameId: number, video: Express.Multer.File) {
    await this.s3.uploadAIVideo(video, 'videos_input', video.originalname);

    const res = await firstValueFrom(
      this.httpService.post(
        `${this.config.get(
          'AI_SERVER_URL',
        )}/Inference/Run_Inference_In_Background/${gameId}`,
      ),
    );

    console.log(res);
  }
}
