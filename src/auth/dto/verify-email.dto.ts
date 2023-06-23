import { IsNotEmpty, IsString, IsBoolean, IsNumber } from "class-validator";

export class VerifyEmailDto {

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    code: string;

}