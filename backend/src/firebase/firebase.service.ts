import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { DeviceTokenService } from '../device-token/device-token.service';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);
  private static readonly MAX_MULTICAST_SIZE = 500;

  constructor(private readonly deviceTokenService: DeviceTokenService) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });

      this.logger.log('Firebase Admin initialized');
    }
  }

  /**
   * Send push notifications and clean up invalid tokens automatically
   */
  async sendPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    if (!tokens.length) {
      this.logger.warn('No FCM tokens to send.');
      return;
    }

    try {
      const uniqueTokens = Array.from(
        new Set(tokens.map((t) => t?.trim()).filter((t): t is string => !!t)),
      );

      if (!uniqueTokens.length) {
        this.logger.warn('All provided FCM tokens were empty/invalid.');
        return;
      }

      const chunks = this.chunk(
        uniqueTokens,
        FirebaseService.MAX_MULTICAST_SIZE,
      );

      this.logger.log(
        `Sending FCM to ${uniqueTokens.length} tokens in ${chunks.length} chunk(s).`,
      );

      for (const chunkTokens of chunks) {
        await this.sendChunk(chunkTokens, title, body, data);
      }
    } catch (err) {
      this.logger.error(
        'FCM send error',
        err instanceof Error ? err.stack : err,
      );
    }
  }

  // ---------------- Internal helpers ----------------

  private async sendChunk(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      data: {
        ...(data || {}),
        title,
        body,
      },
      webpush: {
        headers: { Urgency: 'high' },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    const invalidTokens: string[] = [];

    let successCount = 0;

    response.responses.forEach((res, index) => {
      if (res.success) {
        successCount += 1;
        return;
      }

      const error = res.error as { code?: string } | undefined;
      const code = error?.code;

      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        invalidTokens.push(tokens[index]);
      } else {
        this.logger.warn(
          `FCM send failed | tokenIndex=${index} | code=${code}`,
        );
      }
    });

    const failureCount = tokens.length - successCount;

    this.logger.log(
      `FCM chunk result | tokens=${tokens.length} | success=${successCount} | failure=${failureCount}`,
    );

    if (invalidTokens.length) {
      await this.deviceTokenService.removeTokens(invalidTokens);
      this.logger.log(`Removed ${invalidTokens.length} invalid FCM tokens`);
    }
  }

  private chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }
}
