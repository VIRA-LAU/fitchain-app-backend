import { GameStatus } from '@prisma/client';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class editBookingDto {
  @IsNumber()
  @IsOptional()
  courtId?: number;

  @IsDateString()
  @IsOptional()
  date?: Date;

  @IsOptional()
  status?: GameStatus;

  @IsOptional()
  @IsNumber()
  updatedHomePoints?: number;

  @IsOptional()
  @IsNumber()
  updatedAwayPoints?: number;

  @IsOptional()
  @IsString()
  recordingMode?: 'start' | 'stop';
}
