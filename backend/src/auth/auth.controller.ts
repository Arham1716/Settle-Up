import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import type { AuthenticatedRequest } from './types/auth-request';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.auth.signup(body.email, body.password);
  }

  @Post('login')
  login(@Body() body: SignupDto) {
    return this.auth.login(body.email, body.password);
  }

  // 🔒 Protected route
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
}
}
