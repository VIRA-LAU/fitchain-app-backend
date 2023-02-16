import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditGameDto } from './dto';

@Injectable()
export class GameService {
    constructor(private prisma: PrismaService){}

    async editGame(gameId: number, dto: EditGameDto){
        const game = await this.prisma.game.update({
            where:{
                id: gameId
            },
            data:{
                ...dto,
            }
        })

        return game;
    }
}
