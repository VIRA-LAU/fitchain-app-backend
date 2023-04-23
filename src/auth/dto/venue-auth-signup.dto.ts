import { IsEmail, IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator";

export class VenueAuthSignupDto {

    @IsEmail()
    @IsNotEmpty()
    managerEmail: string;

    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsNotEmpty()
    managerFirstName: string;

    @IsString()
    @IsNotEmpty()
    managerLastName: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    name: string;


    @IsBoolean()
    @IsNotEmpty()
    isVenue: boolean;
    
    constructor(data?: Partial<VenueAuthSignupDto>) {
        Object.assign(this, data);
    }
}