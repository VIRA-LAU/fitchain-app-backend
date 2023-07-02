import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AWSS3Service } from 'src/aws-s3/aws-s3.service';

@Module({
  providers: [UserService, AWSS3Service],
  controllers: [UserController],
})
export class UserModule {}
