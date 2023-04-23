import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSigninDto, AuthSignupDto, VenueAuthSignupDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    
    @Post('signup')
    signup(@Body() dto: Object) {
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
        if (dto.hasOwnProperty('isVenue') && dto['isVenue'] == true) {
            return this.authService.signin(dto, true);
        }
        else {
            return this.authService.signin(dto, false);
        }
    }
}
