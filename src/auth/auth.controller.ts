import { Body, Controller, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSigninDto, AuthSignupDto, BranchAuthSignupDto, VerifyBranchEmailDto, VerifyEmailDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    
    @Post('signup/user')
    signupAsUser(@Body() dto:  AuthSignupDto) {
        return this.authService.signupAsUser(dto);
    }

    @Post('signup/branch')
    signupAsBranch(@Body() dto: BranchAuthSignupDto) {
        return this.authService.signupAsBranch(dto);
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthSigninDto){
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
}
