import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from 'src/common/decorator/user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('sign-in')
      async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: any, // allow us to set cookies
  ) {
    const { access_token, user } = await this.authService.login(body.email, body.password);

    // Set the cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,      // not accessible via JS
      secure: false,       // true in production with HTTPS
      sameSite: 'lax',     // 'lax' or 'strict' depending on your frontend
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return { user }; // token is in cookie, frontend doesn't need it in response
  }

    @Post('sign-up')
    signup(@Body() body: { email: string; password: string }) {
        return this.authService.signup(body.email, body.password);
    }
    

     @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user: any) {
    const profile = {
      email: user.email,
      role: user.role
    }
    return { user: profile }; // user comes from JWT payload
  }
}