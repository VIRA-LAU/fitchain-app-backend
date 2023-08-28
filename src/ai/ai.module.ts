import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { SocketGateway } from 'src/socket.gateway';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [GameModule],
  providers: [AIService, SocketGateway],
  controllers: [AIController],
})
export class AIModule {}
