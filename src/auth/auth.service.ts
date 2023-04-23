import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthSigninDto, AuthSignupDto, VenueAuthSignupDto } from './dto';
import { User, Venue } from '@prisma/client';

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
                const venue = await this.prisma.venue.create({
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
                    access_token: await this.signToken(venue.id, venue.managerEmail),
                    managerFirstName: venue.managerFirstName,
                    managerLastName: venue.managerLastName,
                    managerEmail: venue.managerEmail,
                    venueId: venue.id,
                    venueName: venue.name
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

    async signin(dto: AuthSigninDto) {
        let isVenue = false;
        let user: User | Venue =  await this.prisma.user.findUnique({
            where: {
                email: dto.email,

            }
        })
        if (!user) {
            user = await this.prisma.venue.findUnique({
                where: {
                    managerEmail: dto.email,
                }
            });
            isVenue = true;
        }
        if(!user) throw new ForbiddenException("Credentials incorrect!")

        const pwMatches = await argon.verify(user.hash,dto.password)
        if(!pwMatches) throw new ForbiddenException("Credentials incorrect!")

        if (!isVenue)
            return {
                isVenue: false,
                access_token: await this.signToken(user.id, (user as User).email),
                firstName: (user as User).firstName,
                lastName: (user as User).lastName,
                email: (user as User).email,
                userId: user.id
            };
        else
            return {
                isVenue: true,
                access_token: await this.signToken(user.id, (user as Venue).managerEmail),
                managerFirstName: (user as Venue).managerFirstName,
                managerLastName: (user as Venue).managerLastName,
                managerEmail: (user as Venue).managerEmail,
                name: (user as Venue).name,
                venueId: user.id
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
