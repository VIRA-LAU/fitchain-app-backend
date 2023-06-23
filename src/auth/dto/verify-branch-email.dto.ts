import { IsNotEmpty, IsString, IsBoolean, IsNumber } from "class-validator";

export class VerifyBranchEmailDto {

    @IsNumber()
    @IsNotEmpty()
    branchId: number;

    @IsString()
    @IsNotEmpty()
    code: string;

}