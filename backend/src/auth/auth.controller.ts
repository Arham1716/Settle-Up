import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { DeviceTokenService } from 'src/device-token/device-token.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import type { AuthenticatedRequest } from './types/auth-request';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  // Inject services via constructor
  constructor(
    private readonly authService: AuthService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body.email, body.password);
  }

  @Post('login')
  async login(
    @Body() body: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(body.email, body.password);

    res.cookie('jwt', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return { success: true };
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    if (!password || password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters long',
      );
    }

    return this.authService.resetPassword(token, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }

  // ✅ Save FCM device token
  @UseGuards(JwtAuthGuard)
  @Post('device-token')
  async saveToken(
    @Req() req: AuthenticatedRequest,
    @Body() body: { token: string; platform: string },
  ) {
    const userId = req.user.id;
    await this.deviceTokenService.saveToken(userId, body.token, body.platform);
    return { success: true };
  }
}
