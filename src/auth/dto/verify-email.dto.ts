import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class VerifyEmailDto {

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsString()
    @IsNotEmpty()
    code: string;

}