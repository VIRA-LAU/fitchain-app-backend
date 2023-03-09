import { gameType } from "@prisma/client"
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class createBookingDto{

    @IsString()
    @IsNotEmpty()
    type: gameType

    @IsNumber()
    @IsNotEmpty()
    courtId:number

    @IsDateString() 
    @IsNotEmpty()
    date:Date

    @IsNumber()
    @IsNotEmpty()
    duration:number

}