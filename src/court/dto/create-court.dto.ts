import { TimeSlot } from '@prisma/client';
import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCourtDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  courtType: string;

  @IsNumber()
  @IsNotEmpty()
  nbOfPlayers: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsArray()
  @IsNotEmpty()
  timeSlots: { startTime: number; endTime: number }[];
}
