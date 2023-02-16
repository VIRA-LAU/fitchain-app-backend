import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BranchController } from './branch/branch.controller';
import { BranchModule } from './branch/branch.module';
import { BranchService } from './branch/branch.service';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),AuthModule, UserModule, PrismaModule, BranchModule],
  controllers: [BranchController],
  providers: [BranchService],
})
export class AppModule {}
