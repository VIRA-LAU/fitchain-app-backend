import { Branch } from "@prisma/client"
import { IsArray, IsOptional, IsString } from "class-validator"

export class EditVenueDto{
    
  @IsString()
  @IsOptional()
  name?: string 

  @IsString()
  @IsOptional()
  managerPhoneNumber?:string

  @IsString()
  @IsOptional()
  managerFirstName?:string

  @IsString()
  @IsOptional()
  managerLastName?:string

  @IsString()
  @IsOptional()
  photoDirectoryURL?:string

}