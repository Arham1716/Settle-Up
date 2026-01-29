import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeviceTokenService {
  constructor(private prisma: PrismaService) {}

  async saveToken(userId: string, token: string, platform: string) {
    // Upsert to avoid duplicates
    return this.prisma.deviceToken.upsert({
      where: { token },
      update: { platform, userId },
      create: { token, platform, userId },
    });
  }

  async getTokensForUsers(userIds: string[]) {
    return this.prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { token: true },
    });
  }
}
