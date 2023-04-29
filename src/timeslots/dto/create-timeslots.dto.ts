import { IsNotEmpty, IsNumber, IsString } from "class-validator"

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