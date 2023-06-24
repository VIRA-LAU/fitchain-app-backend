import { IsNotEmpty, IsBoolean, IsNumber } from "class-validator";

export class ResendEmailCodeDto {

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsBoolean()
    @IsNotEmpty()
    isVenue: boolean;

}