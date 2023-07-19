import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { PasswordValidator } from '../validator';

export class ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @Validate(PasswordValidator)
  @IsNotEmpty()
  password: string;
}
