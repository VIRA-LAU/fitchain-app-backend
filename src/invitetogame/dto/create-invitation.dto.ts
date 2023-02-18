import { IsNotEmpty, IsNumber } from "class-validator"

export class CreateInvitationDto{
  
    @IsNumber()
    @IsNotEmpty()
    friendId: number


    @IsNumber()
    @IsNotEmpty()
    gameId: number
  
}