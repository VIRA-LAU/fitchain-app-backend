import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GameController } from './game/game.controller';
import { GameService } from './game/game.service';
import { GameModule } from './game/game.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),AuthModule, UserModule, PrismaModule, GameModule],
  controllers: [GameController],
  providers: [GameService],
})
export class AppModule {}
