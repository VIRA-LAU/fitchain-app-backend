import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Game } from '@prisma/client';
import { GetGame } from 'src/auth/decorator';
import { JwtGaurd } from 'src/auth/gaurd';
import { EditGameDto } from './dto';
import { GameService } from './game.service';

@UseGuards(JwtGaurd)
@Controller('game')
export class GameController {
    constructor(private gameService: GameService){}

    @Get('upcoming')
    getGames(@GetGame() game: Game ){
        return game
    }

    @Patch()
    editGame(@GetGame('id') gameId: number, @Body() dto: EditGameDto){
        return this.gameService.editGame(gameId, dto)
    }
}
