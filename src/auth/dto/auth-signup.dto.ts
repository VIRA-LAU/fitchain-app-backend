import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator";

export class AuthSignupDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}