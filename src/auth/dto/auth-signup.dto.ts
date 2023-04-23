import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator";

export class AuthSignupDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    @IsOptional()
    isVenue: boolean;

    constructor(data?: Partial<AuthSignupDto>) {
        Object.assign(this, data);
    }
}