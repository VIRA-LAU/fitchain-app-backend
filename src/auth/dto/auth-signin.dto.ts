import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional} from "class-validator";

export class AuthSigninDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

}