import { teamType } from '@prisma/client';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRequestToJoinDto {
  @IsNumber()
  @IsNotEmpty()
  gameId: number;

  @IsNotEmpty()
  team: teamType;
}
