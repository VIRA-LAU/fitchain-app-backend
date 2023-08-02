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
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}
