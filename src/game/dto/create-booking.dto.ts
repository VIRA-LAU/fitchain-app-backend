import { gameType } from "@prisma/client"
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString } from "class-validator"

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

    @IsArray()
    @IsNotEmpty()
    timeSlotIds:number[]

}