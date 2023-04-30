import { LatLng } from "@googlemaps/google-maps-services-js";
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator"

export class CoordinatesDto{
    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;

    @IsArray()
    @IsOptional()
    locations?: LatLng[]
}