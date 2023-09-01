import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { GameStatisticsDto } from './dto';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private aiService: AIService) {}

  @Patch('video_processed/:id')
  updateGameStatistics(
    @Param('id', ParseIntPipe) gameId: number,
    @Body() dto: GameStatisticsDto,
  ) {
    return this.aiService.updateGameStatistics(gameId, dto);
  }
}
