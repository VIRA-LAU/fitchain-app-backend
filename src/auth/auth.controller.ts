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
  UpdatePasswordDto,
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

  @HttpCode(HttpStatus.OK)
  @Patch('signout')
  signout(@Body() dto: { userId: number; isBranch: boolean }) {
    return this.authService.signout(dto.userId, dto.isBranch);
  }

  @Get('verifyEmail')
  async verifyUserEmail(@Res() res: Response, @Query('token') token: string) {
    if (!token) res.status(401).send('Invalid token.');
    else
      try {
        await this.authService.verifyEmail(token);
        res
          .status(200)
          .sendFile(
            path.join(
              __dirname,
              './html-templates/email-verification-success.html',
            ),
          );
      } catch (e) {
        console.error(e);
        res.status(401).send('Invalid token.');
      }
  }

  @Patch('resendVerificationEmail')
  resendVerificationEmail(@Body() dto: { email: string; isBranch: boolean }) {
    return this.authService.resendVerificationEmail(dto.email, dto.isBranch);
  }

  @Patch('forgotPassword')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Get('resetPassword')
  async resetPassword(@Res() res: Response, @Query('token') token: string) {
    if (!token) res.status(401).send('Invalid token.');
    else
      try {
        await this.authService.resetPassword(token);
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
    return this.authService.updatePassword(dto.token, dto.password);
  }

  @Get('support')
  async support(@Res() res: Response) {
    res
      .status(200)
      .sendFile(path.join(__dirname, './html-templates/support.html'));
  }
}
