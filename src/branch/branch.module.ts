import { Module } from '@nestjs/common';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { AWSS3Module } from 'src/aws-s3/aws-s3.module';

@Module({
  controllers: [BranchController],
  providers: [BranchService],
  imports: [AWSS3Module],
})
export class BranchModule {}
