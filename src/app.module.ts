import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { InvitetogameModule } from './invitetogame/invitetogame.module';
import { GameModule } from './game/game.module';
import { VenueModule } from './venue/venue.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),AuthModule, UserModule, PrismaModule, InvitetogameModule, GameModule, VenueModule],
})
export class AppModule {}
