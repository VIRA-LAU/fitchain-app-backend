import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional} from "class-validator";

export class AuthSigninDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    @IsOptional()
    isVenue: boolean;

    constructor(data?: Partial<AuthSigninDto>) {
        Object.assign(this, data);
    }

}