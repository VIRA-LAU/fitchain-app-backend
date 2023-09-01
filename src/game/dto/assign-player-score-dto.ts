import { IsNumber } from 'class-validator';

export class assignPlayerScoreDto {
  @IsNumber()
  playerStatisticsId: number;

  @IsNumber()
  userId: number;
}
