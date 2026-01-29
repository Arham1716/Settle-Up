import { Controller, Post, Body } from '@nestjs/common';
import { DeviceTokenService } from './device-token.service';

@Controller('device-token')
export class DeviceTokenController {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  @Post()
  async saveToken(@Body() body: { userId: string; token: string; platform: string }) {
    const { userId, token, platform } = body;
    return this.deviceTokenService.saveToken(userId, token, platform);
  }
}
