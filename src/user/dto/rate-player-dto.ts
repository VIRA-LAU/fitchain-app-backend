import { IsNotEmpty, IsNumber } from 'class-validator';

export class ratePlayerDto {
  @IsNumber()
  @IsNotEmpty()
  playerId: number;

  @IsNumber()
  @IsNotEmpty()
  defense: number;

  @IsNumber()
  @IsNotEmpty()
  offense: number;

  @IsNumber()
  @IsNotEmpty()
  general: number;

  @IsNumber()
  @IsNotEmpty()
  skill: number;

  @IsNumber()
  @IsNotEmpty()
  teamplay: number;

  @IsNumber()
  @IsNotEmpty()
  punctuality: number;

  @IsNumber()
  @IsNotEmpty()
  gameId: number;
}
