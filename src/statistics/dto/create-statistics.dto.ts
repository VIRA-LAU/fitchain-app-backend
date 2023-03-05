import { teamType } from "@prisma/client"
import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateInvitationDto{
  


    @IsNumber()
    @IsNotEmpty()
    gameId: number

  
}