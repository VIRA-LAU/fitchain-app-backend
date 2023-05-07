import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class EditCourtDto{

    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    courtType?: string;

    @IsNumber()
    @IsOptional()
    nbOfPlayers?: number;

    @IsArray()
    @IsOptional()
    timeSlots: number[];

}