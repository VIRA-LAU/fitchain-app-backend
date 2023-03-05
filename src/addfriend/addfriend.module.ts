import { Module } from '@nestjs/common';
import { AddfriendController } from './addfriend.controller';
import { AddfriendService } from './addfriend.service';

@Module({
  controllers: [AddfriendController],
  providers: [AddfriendService]
})
export class AddfriendModule {}
