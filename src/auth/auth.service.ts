import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthSigninDto, AuthSignupDto, VenueAuthSignupDto } from './dto';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService,private config: ConfigService){}

    async signup(dto: AuthSignupDto | VenueAuthSignupDto) {
        const hash = await argon.hash(dto.password);
        try {
            if (dto instanceof (AuthSignupDto)) {
                const user = await this.prisma.user.create({
                    data:{
                        email:dto.email,
                        phoneNumber:dto.phoneNumber,
                        firstName:dto.firstName,
                        lastName: dto.lastName,
                        hash,
                    }
                })
                return {
                    access_token: await this.signToken(user.id, user.email),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    userId: user.id
                }
            }
            else if(dto instanceof(VenueAuthSignupDto)) {
                const user = await this.prisma.venue.create({
                    data: {
                        managerEmail: dto.managerEmail,
                        managerPhoneNumber: dto.phoneNumber,
                        managerFirstName: dto.managerFirstName,
                        managerLastName: dto.managerLastName,
                        name: dto.name,
                        hash
                    }
                })
                return {
                    access_token: await this.signToken(user.id, user.managerEmail),
                    firstName: user.managerFirstName,
                    lastName: user.managerLastName,
                    email: user.managerEmail,
                    userId: user.id
                }
            }


        }catch(error){
            if( error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Credentials taken',);
                }
            }
            throw error;
        }

    }

    async signin(dto: AuthSigninDto, isVenue) {
        
        const user =  isVenue ? await this.prisma.venue.findUnique({
            where: {
                managerEmail: dto.email,
            }
        }) : await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        });

        interface CommonUserProperties {
            email: string;
            firstName: string;
            lastName: string;
        }
        let commonUserProperties: CommonUserProperties;
        if(!user) throw new ForbiddenException("Credentials incorrect!")

        if ('email' in user) {
            // User object
            commonUserProperties = {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            };
          } else {
            // Venue object
            commonUserProperties = {
              email: user.managerEmail,
              firstName: user.managerFirstName,
              lastName: user.managerLastName,
            };
          }

        const pwMatches = await argon.verify(user.hash,dto.password)
        if(!pwMatches) throw new ForbiddenException("Credentials incorrect!")

        return {
            access_token: await this.signToken(user.id, commonUserProperties.email),
            firstName: commonUserProperties.firstName,
            lastName: commonUserProperties.lastName,
            email: commonUserProperties.email,
            userId: user.id
          };
        

    }

    async signToken(userId: number, email: string): Promise<string>{
        const payload = {
            sub: userId,
            email
        }
        const secret = this.config.get('JWT_SECRET')
        const token = await this.jwt.signAsync(payload, {expiresIn:'10d', secret:secret})
        return token
    }
    
}
