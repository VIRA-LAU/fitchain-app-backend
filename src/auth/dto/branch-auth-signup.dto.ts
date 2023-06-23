import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsNumber } from "class-validator";

export class BranchAuthSignupDto {

    @IsNumber()
    @IsNotEmpty()
    venueId: number;

    @IsString()
    @IsNotEmpty()
    location: string;
    
    @IsNumber()
    @IsNotEmpty()
    latitude: number;
    
    @IsNumber()
    @IsNotEmpty()
    longitude: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    managerFirstName: string;

    @IsString()
    @IsNotEmpty()
    managerLastName: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}