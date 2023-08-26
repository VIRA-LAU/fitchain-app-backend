import { InvitationApproval, TeamType } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class EditInvitationDto {
  @IsNumber()
  @IsOptional()
  friendId?: number;

  @IsNumber()
  @IsOptional()
  gameId?: number;

  @IsOptional()
  status?: InvitationApproval;

  @IsOptional()
  team?: TeamType;
}
