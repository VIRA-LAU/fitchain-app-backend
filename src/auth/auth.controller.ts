import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSigninDto, AuthSignupDto, VenueAuthSignupDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    
    @Post('signup')
    signup(@Body() dto: VenueAuthSignupDto | AuthSignupDto) {
        console.log('signup');
        if (dto.hasOwnProperty('isVenue') && dto['isVenue'] == true) {
            const venueDto = new VenueAuthSignupDto(dto);
            return this.authService.signup(venueDto);
        } else {
            const authDto = new AuthSignupDto(dto);
            return this.authService.signup(authDto);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthSigninDto){
        console.log('signin')
        return this.authService.signin(dto);
    }
}
