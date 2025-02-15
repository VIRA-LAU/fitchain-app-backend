import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GameStatisticsDto {
  @IsOptional()
  @IsNumber()
  total_passes: number;

  @IsOptional()
  @IsNumber()
  total_assists: number;

  @IsOptional()
  team_1: {
    points: number;
    possession: number;
    players: {
      [key: number]: {
        recentScore: number;
        scorePerFrame: {
          [key: number]: number;
        };
        '2points': number;
        '3points': number;
        shotsmade: number;
        shotsmissed: number;
        shots_accuracy: number;
      };
    }[];
  };

  @IsOptional()
  team_2: {
    points: number;
    possession: number;
    players: {
      [key: number]: {
        recentScore: number;
        scorePerFrame: {
          [key: number]: number;
        };
        '2points': number;
        '3points': number;
        shotsmade: number;
        shotsmissed: number;
        shots_accuracy: number;
        scored: number;
        missed: number;
      };
    }[];
  };
}
