import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { InvitetogameModule } from './invitetogame/invitetogame.module';
import { GameModule } from './game/game.module';
import { VenueModule } from './venue/venue.module';
import { BranchModule } from './branch/branch.module';
import { CourtModule } from './court/court.module';
import { RequesttojoingameModule } from './requesttojoingame/requesttojoingame.module';
import { AddfriendModule } from './addfriend/addfriend.module';
import { TimeslotsModule } from './timeslots/timeslots.module';
import { MapsModule } from './maps/maps.module';
import { AWSS3Module } from './aws-s3/aws-s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    PrismaModule,
    InvitetogameModule,
    GameModule,
    VenueModule,
    BranchModule,
    CourtModule,
    RequesttojoingameModule,
    AddfriendModule,
    TimeslotsModule,
    MapsModule,
    AWSS3Module,
  ],
})
export class AppModule {}
