import { gameStatus } from "@prisma/client"
import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class editBookingDto{

    @IsNumber()
    @IsOptional( )
    courtId?:number

    @IsDateString() 
    @IsOptional( )
    date?:Date

    @IsOptional( )
    status?: gameStatus

}