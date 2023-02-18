import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class editBookingDto{

    @IsNumber()
    @IsOptional( )
    courtId?:number

    @IsNumber()
    @IsNotEmpty()
    adminId:number

    @IsDate() 
    @IsOptional( )
    date?:Date

}