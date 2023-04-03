import { IsNotEmpty, IsNumber } from "class-validator"

export class ratePlayerDto{

    @IsNumber()
    @IsNotEmpty()
    playerId: number

    @IsNumber()
    @IsNotEmpty()
    performance: number

    @IsNumber()
    @IsNotEmpty()
    punctuality: number

    @IsNumber()
    @IsNotEmpty()
    fairplay: number

    @IsNumber()
    @IsNotEmpty()
    teamPlayer: number

    @IsNumber()
    @IsNotEmpty()
    gameId: number
}
