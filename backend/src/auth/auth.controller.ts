import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import type { AuthenticatedRequest } from './types/auth-request';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return req.user; // user should be added by JwtAuthGuard
  }
}
