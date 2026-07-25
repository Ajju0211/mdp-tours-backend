import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from 'src/common/decorator/user.decorator';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Admin Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  /**
   * Authenticates an admin user and issues a JWT token.
   * The token is returned as an HTTP-only cookie for security.
   * 
   * @param body - The email and password payload
   * @param res - The Express response object for setting cookies
   * @returns The authenticated user profile
   */
  @Post('sign-in')
  @ApiOperation({ summary: 'Admin login (Sets HTTP-only cookie)' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' } } } })
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

  /**
   * Registers a new admin user.
   * 
   * @param body - The email and password payload for the new admin
   * @returns The created user profile
   */
  @Post('sign-up')
  @ApiOperation({ summary: 'Admin signup' })
  @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' } } } })
  signup(@Body() body: { email: string; password: string }) {
    return this.authService.signup(body.email, body.password);
  }


  /**
   * Retrieves the profile of the currently authenticated admin user.
   * Requires a valid JWT access token cookie.
   * 
   * @param user - The decoded user payload from the JWT
   * @returns The current user's profile information
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current admin profile (Requires JWT Cookie/Header)' })
  getProfile(@User() user: any) {
    const profile = {
      email: user.email,
      role: user.role
    }
    return { user: profile }; // user comes from JWT payload
  }

  /**
   * Logs out the current admin user by clearing the JWT HTTP-only cookie.
   * 
   * @param res - The Express response object used to clear cookies
   * @returns A success confirmation message
   */
  @Post('sign-out')
  @ApiOperation({ summary: 'Admin logout (Clears HTTP-only cookie)' })
  logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false, // Match with sign-in cookie security settings (false for dev, true for prod with https)
      sameSite: 'lax',
    });
    return { success: true, message: 'Logged out successfully' };
  }
}