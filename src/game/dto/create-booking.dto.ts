import { gameType } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class createBookingDto {
  @IsString()
  @IsNotEmpty()
  type: gameType;

  @IsNumber()
  @IsNotEmpty()
  courtId: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  startTime: number;

  @IsNumber()
  @IsNotEmpty()
  endTime: number;
}
