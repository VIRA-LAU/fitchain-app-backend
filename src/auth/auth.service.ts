import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthSigninDto, AuthSignupDto, BranchAuthSignupDto } from './dto';
import { Branch, User } from '@prisma/client';
import { EmailService } from './email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async signupAsUser(dto: AuthSignupDto) {
    const existingBranch = await this.prisma.branch.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (existingBranch) throw new BadRequestException('CREDENTIALS_TAKEN');

    const hash = await argon.hash(dto.password);
    const code = uuidv4().substring(0, 4).toUpperCase();
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          hash,
          emailCode: code,
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
      this.emailService.sendEmail(user.email, code.split(''));
      return user.id;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('CREDENTIALS_TAKEN');
        }
      }
      throw error;
    }
  }

  async signupAsBranch(dto: BranchAuthSignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (existingUser) throw new BadRequestException('CREDENTIALS_TAKEN');

    const hash = await argon.hash(dto.password);
    const code = uuidv4().substring(0, 4).toUpperCase();
    try {
      const branch = await this.prisma.branch.create({
        data: {
          email: dto.email,
          managerFirstName: dto.managerFirstName,
          managerLastName: dto.managerLastName,
          venueId: dto.venueId,
          location: dto.location,
          latitude: dto.latitude,
          longitude: dto.longitude,
          hash,
          emailCode: code,
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
      this.emailService.sendEmail(branch.email, code.split(''));
      return branch.id;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('CREDENTIALS_TAKEN');
        }
      }
      throw error;
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

    if (!isBranch)
      return {
        isBranch: false,
        access_token: await this.signToken(user.id, user.email),
        firstName: (user as User).firstName,
        lastName: (user as User).lastName,
        email: user.email,
        userId: user.id,
      };
    else
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

  async signToken(userId: number, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '10d',
      secret: secret,
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

    this.emailService.sendEmail(user.email, code.split(''));
  }
}
