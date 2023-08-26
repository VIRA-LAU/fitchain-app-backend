import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GameStatisticsDto {
  @IsOptional()
  team_1: {
    points: number;
    possession: string;
    players: {
      scored: number;
      missed: number;
    }[];
  };

  @IsOptional()
  team_2: {
    points: number;
    possession: string;
    players: {
      scored: number;
      missed: number;
    }[];
  };
}
