import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSigninDto, AuthSignupDto, BranchAuthSignupDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    
    @Post('signup')
    signup(@Body() dto: BranchAuthSignupDto | AuthSignupDto) {
        if (dto.hasOwnProperty('isVenue') && dto['isVenue'] == true) {
            const venueDto = new BranchAuthSignupDto(dto);
            return this.authService.signup(venueDto);
        } else {
            const authDto = new AuthSignupDto(dto);
            return this.authService.signup(authDto);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthSigninDto){
        return this.authService.signin(dto);
    }
}
