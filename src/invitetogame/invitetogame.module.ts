import { Module } from '@nestjs/common';
import { InvitetogameService } from './invitetogame.service';
import { InvitetogameController } from './invitetogame.controller';

@Module({
  providers: [InvitetogameService],
  controllers: [InvitetogameController],
})
export class InvitetogameModule {}
