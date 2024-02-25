import { GameType } from '@prisma/client';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class createBookingDto {
  @IsString()
  @IsNotEmpty()
  type: GameType;

  @IsNumber()
  @IsOptional()
  courtId?: number;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsBoolean()
  @IsNotEmpty()
  isBooked: boolean;
}
