import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthSigninDto, AuthSignupDto, BranchAuthSignupDto } from './dto';
import { Branch, User } from '@prisma/client';
import { EmailService } from './email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private jwt_secret: string;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly emailService: EmailService,
  ) {
    this.jwt_secret = this.config.get('JWT_SECRET');
  }

  isBranch(user: User | Branch): user is Branch {
    return (user as Branch).venueId !== undefined;
  }

  async signupAsUser(dto: AuthSignupDto) {
    await this.getUser(dto.email, 'check-existing');

    const hash = await argon.hash(dto.password);
    const code = uuidv4().substring(0, 4).toUpperCase();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        hash,
        emailCode: code,
        notificationsToken: dto.notificationsToken || undefined,
      },
    });
    setTimeout(async () => {
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailCode: null,
        },
      });
    }, 60 * 60 * 1000);
    this.emailService.sendEmailVerificationEmail(user.email, code.split(''));
    return user.id;
  }

  async signupAsBranch(dto: BranchAuthSignupDto) {
    await this.getUser(dto.email, 'check-existing');

    const hash = await argon.hash(dto.password);
    const code = uuidv4().substring(0, 4).toUpperCase();

    const venue = await this.prisma.venue.create({
      data: {
        name: dto.venueName,
        description: dto.description,
      },
    });
    const branch = await this.prisma.branch.create({
      data: {
        venueId: venue.id,
        email: dto.email,
        managerFirstName: dto.managerFirstName,
        managerLastName: dto.managerLastName,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        hash,
        emailCode: code,
        notificationsToken: dto.notificationsToken || undefined,
      },
    });
    setTimeout(async () => {
      await this.prisma.branch.update({
        where: {
          id: branch.id,
        },
        data: {
          emailCode: null,
        },
      });
    }, 60 * 60 * 1000);
    this.emailService.sendEmailVerificationEmail(branch.email, code.split(''));
    return branch.id;
  }

  async getUser(email: string, purpose: 'check-existing' | 'return') {
    var existingUser: User | Branch = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!existingUser)
      existingUser = await this.prisma.branch.findUnique({
        where: {
          email: email,
        },
      });
    if (purpose === 'check-existing' && existingUser)
      throw new BadRequestException('CREDENTIALS_TAKEN');
    else if (purpose === 'return') {
      if (existingUser) return existingUser;
      else throw new BadRequestException('INVALID_EMAIL');
    }
  }

  async signin(dto: AuthSigninDto) {
    let isBranch = false;
    let user:
      | User
      | (Branch & {
          venue: {
            name: string;
          };
        }) = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      user = await this.prisma.branch.findUnique({
        where: {
          email: dto.email,
        },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      isBranch = true;
    }
    if (!user) throw new BadRequestException('CREDENTIALS_INCORRECT');

    if (!user.emailVerified)
      throw new BadRequestException({
        statusCode: 400,
        message: 'EMAIL_NOT_VERIFIED',
        userId: user.id,
        isBranch,
      });

    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) throw new BadRequestException('CREDENTIALS_INCORRECT');

    if (!isBranch) {
      if (dto.notificationsToken !== user.notificationsToken)
        await this.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            notificationsToken: dto.notificationsToken,
          },
        });
      return {
        isBranch: false,
        access_token: await this.signToken(user.id, user.email),
        firstName: (user as User).firstName,
        lastName: (user as User).lastName,
        email: user.email,
        userId: user.id,
      };
    } else {
      if (dto.notificationsToken !== user.notificationsToken)
        await this.prisma.branch.update({
          where: {
            id: user.id,
          },
          data: {
            notificationsToken: dto.notificationsToken,
          },
        });
      return {
        isBranch: true,
        access_token: await this.signToken(user.id, user.email),
        managerFirstName: (user as Branch).managerFirstName,
        managerLastName: (user as Branch).managerLastName,
        email: user.email,
        branchId: user.id,
        venueId: (
          user as Branch & {
            venue: {
              id: number;
              name: string;
            };
          }
        ).venue.id,
        venueName: (
          user as Branch & {
            venue: {
              id: number;
              name: string;
            };
          }
        ).venue.name,
        branchLocation: (user as Branch).location,
      };
    }
  }

  async signout(userId: number, isBranch: boolean) {
    if (!isBranch)
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          notificationsToken: null,
        },
      });
    else
      await this.prisma.branch.update({
        where: {
          id: userId,
        },
        data: {
          notificationsToken: null,
        },
      });
  }

  async signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '10d',
      secret: this.jwt_secret,
    });
    return token;
  }

  async verifyUserEmail(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (code.match(user.emailCode)) {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          emailVerified: true,
        },
      });
      return {
        access_token: await this.signToken(user.id, user.email),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userId: user.id,
      };
    } else throw new BadRequestException('INCORRECT_CODE');
  }

  async verifyBranchEmail(branchId: number, code: string) {
    const branch = await this.prisma.branch.findUnique({
      where: {
        id: branchId,
      },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (code.match(branch.emailCode)) {
      await this.prisma.branch.update({
        where: {
          id: branchId,
        },
        data: {
          emailVerified: true,
        },
      });
      return {
        access_token: await this.signToken(branch.id, branch.email),
        managerFirstName: branch.managerFirstName,
        managerLastName: branch.managerLastName,
        email: branch.email,
        branchId: branch.id,
        venueId: branch.venue.id,
        venueName: branch.venue.name,
        branchLocation: branch.location,
      };
    } else throw new BadRequestException('INCORRECT_CODE');
  }

  async resendEmailCode(userId: number, isBranch: boolean) {
    const code = uuidv4().substring(0, 4).toUpperCase();

    let user: User | Branch;

    if (!isBranch) {
      user = await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          emailCode: code,
        },
      });
      setTimeout(async () => {
        await this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            emailCode: null,
          },
        });
      }, 60 * 60 * 1000);
    } else {
      user = await this.prisma.branch.update({
        where: {
          id: userId,
        },
        data: {
          emailCode: code,
        },
      });
      setTimeout(async () => {
        await this.prisma.branch.update({
          where: {
            id: userId,
          },
          data: {
            emailCode: null,
          },
        });
      }, 60 * 60 * 1000);
    }

    this.emailService.sendEmailVerificationEmail(user.email, code.split(''));
  }

  async forgotPassword(email: string) {
    const user = await this.getUser(email, 'return');
    if (!user.emailVerified)
      throw new BadRequestException('EMAIL_NOT_VERIFIED');
    else {
      const token = await this.jwt.signAsync(
        { sub: user.id, email },
        {
          expiresIn: '30m',
          secret: this.jwt_secret.concat(user.hash),
        },
      );
      await this.emailService.sendPasswordResetEmail(
        email,
        `${this.config.get(
          'SERVER_URL',
        )}:3000/auth/resetPassword?token=${token}&email=${email}`,
      );
      return { status: 'success' };
    }
  }

  async resetPassword(token: string, email: string) {
    const user = await this.getUser(email, 'return');
    return this.jwt.verify(token, {
      secret: this.jwt_secret.concat(user.hash),
    });
  }

  async updatePassword(token: string, email: string, password: string) {
    const user = await this.getUser(email, 'return');
    await this.jwt.verify(token, {
      secret: this.jwt_secret.concat(user.hash),
    });
    const newHash = await argon.hash(password);
    if (this.isBranch(user))
      await this.prisma.branch.update({
        where: {
          id: user.id,
        },
        data: {
          hash: newHash,
        },
      });
    else
      await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          hash: newHash,
        },
      });
    return { status: 'success' };
  }
}
