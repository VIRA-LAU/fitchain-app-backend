import { InvitationApproval, TeamType } from '@prisma/client';
import { IsNumber, IsOptional } from 'class-validator';

export class EditRequestToJoinDto {
  @IsNumber()
  @IsOptional()
  gameId?: number;

  @IsOptional()
  status?: InvitationApproval;

  @IsOptional()
  team?: TeamType;
}
