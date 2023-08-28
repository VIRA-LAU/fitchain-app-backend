import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { HttpModule } from '@nestjs/axios';
import { SocketGateway } from 'src/socket.gateway';

@Module({
  imports: [HttpModule],
  providers: [GameService, SocketGateway],
  exports: [GameService],
  controllers: [GameController],
})
export class GameModule {}
