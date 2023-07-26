import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvitationDto } from './dto';
import { EditInvitationDto } from './dto/edit-invitation.dto';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class InvitetogameService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async getSentInvitations(userId: number) {
    return this.prisma.inviteToGame.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        team: true,
        status: true,
        friend: {
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
            gameTimeSlots: {
              select: {
                timeSlot: true,
              },
            },
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

  async getReceivedInvitations(userId: number) {
    return this.prisma.inviteToGame.findMany({
      where: {
        AND: [
          {
            friendId: userId,
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
            gameTimeSlots: {
              select: {
                timeSlot: true,
              },
            },
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

  async getSentInvitationById(userId: number, invitationId: number) {
    const sentInvitation = this.prisma.inviteToGame.findFirst({
      where: {
        id: invitationId,
        userId: userId,
      },
    });

    return sentInvitation;
  }

  async getReceivedInvitationById(userId: number, invitationId: number) {
    const receievdInvitation = this.prisma.inviteToGame.findFirst({
      where: {
        id: invitationId,
        friendId: userId,
      },
    });

    return receievdInvitation;
  }

  async createInvitation(userId: number, dto: CreateInvitationDto) {
    const invitation = await this.prisma.inviteToGame.create({
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
        friend: {
          select: {
            notificationsToken: true,
          },
        },
        game: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    });
    this.notificationsService.sendNotification(
      [invitation.friend.notificationsToken],
      'Game Invitation',
      `${invitation.user.firstName} ${
        invitation.user.lastName
      } invited you to join their ${invitation.game.type.toLowerCase()} game.`,
      `game/${invitation.game.id}`,
    );
    return invitation;
  }

  async editInvitationById(
    userId: number,
    invitationId: number,
    dto: EditInvitationDto,
  ) {
    const invitation = await this.prisma.inviteToGame.findUnique({
      where: {
        id: invitationId,
      },
    });

    if (!invitation) throw new ForbiddenException('Access to edit denied');

    const invitationResponse = await this.prisma.inviteToGame.update({
      where: {
        id: invitationId,
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
        friend: {
          select: {
            firstName: true,
            lastName: true,
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
        [invitationResponse.user.notificationsToken],
        'Invitation Accepted',
        `${invitationResponse.friend.firstName} ${invitationResponse.friend.lastName} accepted your game invitation.`,
        `game/${invitationResponse.game.id}`,
      );
    return { result: 'success' };
  }

  async deleteInvitationById(userId: number, invitationId: number) {
    const invitation = await this.prisma.inviteToGame.findUnique({
      where: {
        id: invitationId,
      },
    });

    if (!invitation) throw new ForbiddenException('Access to edit denied');

    await this.prisma.inviteToGame.delete({
      where: {
        id: invitationId,
      },
    });
  }
}
