import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
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
    // this.authService.
  }

  @Get('resetPassword')
  resetPassword(@Res() res: Response) {
    res
      .status(200)
      .sendFile(path.join(__dirname, './html-templates/password-reset.html'));
  }

  @Patch('updatePassword')
  updatePassword(@Body() dto: UpdatePasswordDto, @Res() res: Response) {
    console.log(dto);
    res.status(200).json(dto);
  }
}
