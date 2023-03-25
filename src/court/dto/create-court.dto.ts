import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class CreateCourtDto{

    @IsString()
    @IsNotEmpty()
    courtType: string;

    @IsNumber()
    @IsNotEmpty()
    nbOfPlayers: number;

    @IsNumber()
    @IsNotEmpty()
    branchId: number;
    
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsNumber()
    @IsNotEmpty()
    rating: number;

}