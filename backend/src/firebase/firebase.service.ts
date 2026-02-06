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
      this.logger.warn("No FCM tokens to send.");
      return;
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: { title, body },
      data,
      webpush: { fcmOptions: { link: data?.url } },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);

      this.logger.log(`FCM request sent to ${tokens.length} tokens.`);

      response.responses.forEach((res, index) => {
        if (res.success) {
          this.logger.log(`✅ Token ${tokens[index]} sent successfully`);
        } else {
          const code = (res.error as { code?: string })?.code;
          this.logger.error(
            `❌ Failed to send to ${tokens[index]} | code=${code} | message=${res.error?.message}`
          );

          // Optional: remove invalid tokens
          if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token"
          ) {
            this.logger.warn(`Removing invalid token ${tokens[index]}`);
            // await this.deviceTokenService.removeToken(tokens[index])
          }
        }
      });
    } catch (err) {
      this.logger.error("FCM send error", err instanceof Error ? err.stack : err);
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
      notification: { title, body }, // fallback
      data,
      webpush: {
        headers: { Urgency: 'high' },
        notification: {
          title,
          body,
          icon: '/logo.png',
          click_action: data?.url,
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    const invalidTokens: string[] = [];

    response.responses.forEach((res, index) => {
      if (res.success) return;

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
