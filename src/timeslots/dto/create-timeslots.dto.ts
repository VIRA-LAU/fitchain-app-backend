import { CourtTimeSlots, GameTimeSlots } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateTimeslotsDto{

    @IsString()
    @IsNotEmpty()
    startTime: string;
    
    @IsString()
    @IsNotEmpty()
    endTime: string;
    

    @IsNumber()
    @IsNotEmpty()
    courtId: number;
}