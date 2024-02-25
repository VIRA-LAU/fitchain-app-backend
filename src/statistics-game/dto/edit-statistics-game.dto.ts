// import { StatisticsGameStatus } from '@prisma/client';
// import { IsNumber, IsOptional, IsArray } from 'class-validator';

// class PlayerStatisticsDto {
//   @IsNumber()
//   @IsOptional()
//   gameNumber?: number;

//   @IsNumber()
//   @IsOptional()
//   twoPointsMade?: number;

//   @IsNumber()
//   @IsOptional()
//   twoPointsMissed?: number;

//   @IsNumber()
//   @IsOptional()
//   threePointsMade?: number;

//   @IsNumber()
//   @IsOptional()
//   threePointsMissed?: number;

//   @IsNumber()
//   @IsOptional()
//   assists?: number;

//   @IsNumber()
//   @IsOptional()
//   blocks?: number;

//   @IsNumber()
//   @IsOptional()
//   rebounds?: number;

//   @IsNumber()
//   @IsOptional()
//   steals?: number;
// }

// export class EditStatisticsGameDto {
//   @IsOptional()
//   status?: StatisticsGameStatus;

//   @IsArray()
//   @IsOptional()
//   playerStatistics?: PlayerStatisticsDto[];
// }
