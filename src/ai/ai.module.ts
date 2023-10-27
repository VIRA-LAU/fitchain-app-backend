import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { AIController } from './ai.controller';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [GameModule],
  providers: [AIService],
  controllers: [AIController],
})
export class AIModule {}
