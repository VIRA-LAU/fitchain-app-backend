import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class createFollowGameDto{

    @IsNumber()
    @IsNotEmpty()
    gameId:number

}