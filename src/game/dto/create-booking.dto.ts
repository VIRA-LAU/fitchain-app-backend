import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class createBookingDto{

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