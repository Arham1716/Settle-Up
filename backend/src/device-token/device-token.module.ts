import { Module } from '@nestjs/common';
import { DeviceTokenService } from './device-token.service';
import { DeviceTokenController } from './device-token.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DeviceTokenController],
  providers: [DeviceTokenService, PrismaService],
  exports: [DeviceTokenService],
})
export class DeviceTokenModule {}
