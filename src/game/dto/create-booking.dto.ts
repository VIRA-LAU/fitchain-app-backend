import { GameType } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class createBookingDto {
  @IsString()
  @IsNotEmpty()
  type: GameType;

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
