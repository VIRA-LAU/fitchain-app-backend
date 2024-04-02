import { Module } from '@nestjs/common';
import { WebAppService } from './web-app.service';
import { WebAppController } from './web-app.controller';

@Module({
  providers: [WebAppService],
  exports: [WebAppService],
  controllers: [WebAppController],
})
export class WebAppModule {}
