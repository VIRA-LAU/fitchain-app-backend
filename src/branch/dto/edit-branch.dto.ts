import { IsNumber, IsOptional, IsString } from "class-validator";

export class EditBranchDto{

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    photoDirectoryUrl?: string;
    
    @IsString()
    @IsOptional()
    coverPhotoUrl?: string;

    @IsNumber()
    @IsOptional()
    rating?: number;
}