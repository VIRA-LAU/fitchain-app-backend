import { invitationApproval, teamType } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator"

export class EditInvitationDto{  
  
    @IsNumber()
    @IsNotEmpty()
    friendId?: number

    @IsNumber()
    @IsNotEmpty()
    gameId?: number

    @IsOptional()
    status?: invitationApproval;

    @IsOptional()
    team?: teamType

    
}