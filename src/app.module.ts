import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CourtModule } from './court/court.module';
import { CourtController } from './court/court.controller';
import { CourtService } from './court/court.service';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),AuthModule, UserModule, PrismaModule, CourtModule],
  controllers: [CourtController],
  providers: [CourtService, ],
})
export class AppModule {}
