import { CourtTimeSlots, GameTimeSlots } from "@prisma/client";
import { IsNotEmpty, IsNumber } from "class-validator"

export class DeleteTimeSlotDto{

    @IsNumber()
    @IsNotEmpty()
    courtId: number;

    @IsNumber()
    @IsNotEmpty()
    timeslotId: number;
}