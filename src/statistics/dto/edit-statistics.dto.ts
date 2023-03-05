import { invitationApproval, teamType } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsOptional } from "class-validator"

export class EditInvitationDto{  

    @IsNumber()
    @IsOptional()
    gameId?: number


    
}