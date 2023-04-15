import { gameStatus } from "@prisma/client"
import { IsDateString, IsNumber, IsOptional } from "class-validator"

export class editBookingDto{

    @IsNumber()
    @IsOptional()
    courtId?:number

    @IsDateString() 
    @IsOptional()
    date?:Date

    @IsOptional()
    status?: gameStatus

    @IsOptional()
    @IsNumber()
    homeScore?: number

    @IsOptional()
    @IsNumber()
    awayScore?: number
}