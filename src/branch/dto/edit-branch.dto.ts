import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditBranchDto{

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    photoDirectoryURL?: string;

    @IsNumber()
    @IsOptional()
    rating?: number;
}