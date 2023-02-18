import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class createBookingDto{

    @IsNumber()
    @IsNotEmpty()
    courtId:number

    @IsNumber()
    @IsNotEmpty()
    adminId:number

    @IsDate() 
    @IsNotEmpty()
    date:Date

}