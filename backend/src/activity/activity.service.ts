import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType, Prisma } from '@prisma/client';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class ActivityService {
  private logger = new Logger(ActivityService.name);

  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  async getUserActivity(userId: string) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        actor: { select: { id: true, name: true, email: true } },
        group: { select: { id: true, name: true } },
      },
    });
  }

  async logGroupActivity(params: {
    actorId: string;
    groupId: string;
    type: ActivityType;
    title: string;
    metadata?: Prisma.InputJsonValue;
    recipients?: string[];
    excludeActor?: boolean;
  }) {
    // 1️⃣ Determine recipients
    let recipients: string[];
    if (params.recipients) {
      recipients = params.recipients;
    } else {
      const memberIds = await this.getActiveGroupMemberIds(params.groupId);
      recipients = params.excludeActor
        ? memberIds.filter((id) => id !== params.actorId)
        : memberIds;
    }

    if (!recipients.length) return;

    // 2️⃣ Log activities in DB (in parallel)
    await Promise.all(
      recipients.map((userId) =>
        this.prisma.activity.create({
          data: {
            actorId: params.actorId,
            userId,
            groupId: params.groupId,
            type: params.type,
            title: params.title,
            metadata: params.metadata,
          },
        }),
      ),
    );

    // 3️⃣ Send push notifications via Firebase
    try {
      // Fetch FCM tokens for recipients
      const users = await this.prisma.user.findMany({
        where: { id: { in: recipients } },
        select: { fcmToken: true }, // assuming you store FCM tokens in user table
      });

      const tokens = users
        .map((u) => u.fcmToken)
        .filter((t): t is string => !!t); // remove null/undefined

      if (!tokens.length) return;

      await this.firebaseService.sendPushNotification(
        tokens,
        'New Activity',
        params.title,
        params.metadata as Record<string, string> | undefined,
      );

      this.logger.log(
        `Push notification sent to ${tokens.length} users for group ${params.groupId}`,
      );
    } catch (err) {
      this.logger.error('Failed to send push notification', err);
    }
  }

  private async getActiveGroupMemberIds(groupId: string): Promise<string[]> {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId, leftAt: null },
      select: { userId: true },
    });
    return members.map((m) => m.userId);
  }
}
