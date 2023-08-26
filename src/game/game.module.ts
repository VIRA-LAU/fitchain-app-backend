import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { SocketGateway } from 'src/socket.gateway';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GameService, SocketGateway],
  controllers: [GameController],
})
export class GameModule {}
