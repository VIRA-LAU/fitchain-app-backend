import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestToJoinDto, EditRequestToJoinDto } from './dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class RequesttojoingameService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getSentRequests(userId: number) {
    return this.prisma.requestToJoinGame.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        team: true,
        status: true,
        game: {
          select: {
            id: true,
            type: true,
            date: true,
            createdAt: true,
            startTime: true,
            endTime: true,
            court: {
              select: {
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
          },
        },
      },
    });
  }

  async getRecievedRequests(userId: number) {
    return this.prisma.requestToJoinGame.findMany({
      where: {
        AND: [
          {
            game: {
              adminId: userId,
            },
          },
          { status: 'PENDING' },
        ],
      },
      select: {
        id: true,
        team: true,
        status: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
          },
        },
        game: {
          select: {
            id: true,
            type: true,
            date: true,
            createdAt: true,
            startTime: true,
            endTime: true,
            court: {
              select: {
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
          },
        },
      },
    });
  }

  async getSentRequestById(userId: number, requestId: number) {
    const sentRequest = this.prisma.requestToJoinGame.findFirst({
      where: {
        id: requestId,
        userId: userId,
      },
    });

    return sentRequest;
  }

  async getReceivedRequestById(userId: number, requestId: number) {
    const receivedRequest = this.prisma.requestToJoinGame.findFirst({
      where: {
        id: requestId,
        game: {
          adminId: userId,
        },
      },
    });

    return receivedRequest;
  }

  async createRequest(userId: number, dto: CreateRequestToJoinDto) {
    const request = await this.prisma.requestToJoinGame.create({
      data: {
        userId,
        ...dto,
      },
      select: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        game: {
          select: {
            type: true,
            admin: {
              select: {
                notificationsToken: true,
              },
            },
          },
        },
      },
    });
    this.notificationsService.sendNotification(
      [request.game.admin.notificationsToken],
      'Join Request',
      `${request.user.firstName} ${
        request.user.lastName
      } requested to join your ${request.game.type.toLowerCase()} game.`,
      'home',
    );
    return request;
  }

  async editRequestById(
    userId: number,
    requestId: number,
    dto: EditRequestToJoinDto,
  ) {
    const request = await this.prisma.requestToJoinGame.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request) throw new ForbiddenException('Access to edit denied');

    const requestResponse = await this.prisma.requestToJoinGame.update({
      where: {
        id: requestId,
      },
      data: {
        ...dto,
      },
      select: {
        user: {
          select: {
            notificationsToken: true,
          },
        },
        game: {
          select: {
            id: true,
          },
        },
      },
    });

    if (dto.status && dto.status === 'APPROVED')
      this.notificationsService.sendNotification(
        [requestResponse.user.notificationsToken],
        'Request Accepted',
        `Your join request was accepted.`,
        `game/${requestResponse.game.id}`,
      );
    return { status: 'success' };
  }

  async deleteRequestById(userId: number, requestId: number) {
    const request = await this.prisma.requestToJoinGame.findUnique({
      where: {
        id: requestId,
      },
    });

    if (!request || request.userId != userId)
      throw new ForbiddenException('Access to edit denied');

    await this.prisma.requestToJoinGame.delete({
      where: {
        id: requestId,
      },
    });
  }
}
