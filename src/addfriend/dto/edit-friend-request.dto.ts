import { InvitationApproval } from '@prisma/client';
import { IsNumber, IsOptional } from 'class-validator';

export class EditFriendRequestDto {
  @IsNumber()
  @IsOptional()
  friendId?: number;

  @IsOptional()
  status?: InvitationApproval;
}
