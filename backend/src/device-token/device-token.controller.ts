import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DeviceTokenService } from './device-token.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('device-token')
@UseGuards(JwtAuthGuard)
export class DeviceTokenController {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  @Post()
  async saveToken(
    @Req() req: AuthenticatedRequest,
    @Body() body: { token: string; platform: string },
  ): Promise<void> {
    await this.deviceTokenService.saveToken(
      req.user.id,
      body.token,
      body.platform,
    );
  }
}
