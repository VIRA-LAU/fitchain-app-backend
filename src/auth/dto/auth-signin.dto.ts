import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthSigninDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  notificationsToken?: string;
}
