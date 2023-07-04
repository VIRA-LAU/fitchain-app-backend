import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AWSS3Module } from 'src/aws-s3/aws-s3.module';

@Module({
  providers: [UserService],
  controllers: [UserController],
  imports: [AWSS3Module],
})
export class UserModule {}
