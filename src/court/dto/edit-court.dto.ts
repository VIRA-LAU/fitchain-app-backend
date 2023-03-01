import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditCourtDto{

    @IsString()
    @IsOptional()
    courtType?: string;

    @IsNumber()
    @IsOptional()
    nbOfPlayers?: number;

    @IsNumber()
    @IsOptional()
    branchId?: number;

}