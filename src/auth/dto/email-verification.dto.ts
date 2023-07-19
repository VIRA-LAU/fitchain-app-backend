import { IsNotEmpty, IsBoolean, IsNumber, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class VerifyBranchEmailDto {
  @IsNumber()
  @IsNotEmpty()
  branchId: number;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ResendEmailCodeDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsBoolean()
  @IsNotEmpty()
  isBranch: boolean;
}
