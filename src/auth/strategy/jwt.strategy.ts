import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { Branch, User } from "@prisma/client";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(config: ConfigService, private prisma: PrismaService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET'),
        })
    }

    async validate(payload: {sub: number, email: string}){
        let user : User | Branch = await this.prisma.user.findUnique({
            where:{
                email:payload.email
            }
        })
        if (!user)
            user = await this.prisma.branch.findUnique({
                where:{
                    managerEmail:payload.email
                }
            })
        delete user.hash;
        return user;
    }
}