import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthSigninDto,
  AuthSignupDto,
  BranchAuthSignupDto,
  ForgotPasswordDto,
  ResendEmailCodeDto,
  UpdatePasswordDto,
  VerifyBranchEmailDto,
  VerifyEmailDto,
} from './dto';
import * as path from 'path';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup/user')
  signupAsUser(@Body() dto: AuthSignupDto) {
    return this.authService.signupAsUser(dto);
  }

  @Post('signup/branch')
  signupAsBranch(@Body() dto: BranchAuthSignupDto) {
    return this.authService.signupAsBranch(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthSigninDto) {
    return this.authService.signin(dto);
  }

  @Patch('verifyEmail/user')
  verifyUserEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyUserEmail(dto.userId, dto.code);
  }

  @Patch('verifyEmail/branch')
  verifyBranchEmail(@Body() dto: VerifyBranchEmailDto) {
    return this.authService.verifyBranchEmail(dto.branchId, dto.code);
  }

  @Patch('resendEmailCode')
  resendEmailCode(@Body() dto: ResendEmailCodeDto) {
    return this.authService.resendEmailCode(dto.userId, dto.isBranch);
  }

  @Patch('forgotPassword')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Get('resetPassword')
  async resetPassword(
    @Res() res: Response,
    @Query('token') token: string,
    @Query('email') email: string,
  ) {
    if (!token || !email) res.status(401).send('Invalid token.');
    else
      try {
        await this.authService.resetPassword(token, email);
        res
          .status(200)
          .sendFile(
            path.join(__dirname, './html-templates/password-reset.html'),
          );
      } catch (e) {
        console.error(e);
        res.status(401).send('Invalid token.');
      }
  }

  @Patch('updatePassword')
  updatePassword(@Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(dto.token, dto.email, dto.password);
  }
}
