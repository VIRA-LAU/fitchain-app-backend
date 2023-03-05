import { invitationApproval, teamType } from "@prisma/client";
import { IsNumber, IsOptional } from "class-validator"

export class EditRequestToJoinDto{  
  

    @IsNumber()
    @IsOptional()
    gameId?: number

    @IsOptional()
    status?: invitationApproval;

    @IsOptional()
    team?: teamType

    
}