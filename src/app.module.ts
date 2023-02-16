import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { VenueModule } from './venue/venue.module';
import { VenueController } from './venue/venue.controller';
import { VenueService } from './venue/venue.service';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),AuthModule, UserModule, PrismaModule, VenueModule],
  controllers: [VenueController],
  providers: [VenueService],
})
export class AppModule {}
