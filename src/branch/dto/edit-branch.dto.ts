import { IsNumber, IsOptional, IsString } from 'class-validator';

export class EditBranchDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  profilePhotoUrl?: string;

  @IsString()
  @IsOptional()
  coverPhotoUrl?: string;

  @IsString()
  @IsOptional()
  photoDirectoryUrl?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;
}
