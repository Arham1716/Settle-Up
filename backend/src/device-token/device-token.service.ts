import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeviceToken } from '@prisma/client';

@Injectable()
export class DeviceTokenService {
  private readonly logger = new Logger(DeviceTokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save or update an FCM device token.
   * - One token belongs to exactly one user at a time
   * - Supports multi-device per user
   */
  async saveToken(
    userId: string,
    token: string,
    platform: string,
  ): Promise<DeviceToken | void> {
    if (!token || !userId) return;

    return this.prisma.deviceToken.upsert({
      where: { token },
      update: {
        userId,
        platform,
        updatedAt: new Date(),
      },
      create: {
        token,
        userId,
        platform,
      },
    });
  }

  /**
   * Get all unique FCM tokens for a list of users.
   * - Used for push notifications
   */
  async getTokensForUsers(userIds: string[]): Promise<string[]> {
    if (!userIds.length) return [];

    const records = await this.prisma.deviceToken.findMany({
      where: {
        userId: { in: userIds },
      },
      select: {
        token: true,
      },
    });

    // Ensure uniqueness (important for safety)
    return Array.from(new Set(records.map((r) => r.token)));
  }

  /**
   * Remove a single invalid or expired FCM token
   */
  async removeToken(token: string): Promise<void> {
    if (!token) return;

    try {
      await this.prisma.deviceToken.delete({
        where: { token },
      });
      this.logger.log(`Removed invalid FCM token`);
    } catch (err) {
      // Token might already be deleted — safe to ignore
      this.logger.warn(`Attempted to remove non-existent FCM token`);
    }
  }

  /**
   * Remove multiple invalid tokens (batch-safe)
   * Useful after multicast send failures
   */
  async removeTokens(tokens: string[]): Promise<void> {
    if (!tokens.length) return;

    await this.prisma.deviceToken.deleteMany({
      where: {
        token: { in: tokens },
      },
    });

    this.logger.log(`Removed ${tokens.length} invalid FCM tokens`);
  }

  /**
   * Remove all tokens for a user (logout, account deletion)
   */
  async removeAllForUser(userId: string): Promise<void> {
    if (!userId) return;

    await this.prisma.deviceToken.deleteMany({
      where: { userId },
    });

    this.logger.log(`Removed all FCM tokens for user ${userId}`);
  }
}
