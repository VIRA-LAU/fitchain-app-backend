import { invitationApproval } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator"

export class EditInvitationDto{  
  
    @IsNumber()
    @IsNotEmpty()
    userId: number

    @IsNumber()
    @IsNotEmpty()
    friendId: number

    @IsNumber()
    @IsNotEmpty()
    gameId: number

    @IsNotEmpty()
    @IsOptional()
    status: invitationApproval;

    
}