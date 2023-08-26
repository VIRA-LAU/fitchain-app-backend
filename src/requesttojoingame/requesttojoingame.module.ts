import { Module } from '@nestjs/common';
import { RequesttojoingameController } from './requesttojoingame.controller';
import { RequesttojoingameService } from './requesttojoingame.service';

@Module({
  controllers: [RequesttojoingameController],
  providers: [RequesttojoingameService],
})
export class RequesttojoingameModule {}
