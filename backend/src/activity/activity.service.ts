import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType, Prisma } from '@prisma/client';
import { FirebaseService } from '../firebase/firebase.service';
import { DeviceTokenService } from '../device-token/device-token.service';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  // ---------------- Get User Activity ----------------
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

  // ---------------- Log Group Activity + Push ----------------
  async logGroupActivity(params: {
    actorId: string;
    groupId: string;
    type: ActivityType;
    title: string;
    metadata?: Prisma.InputJsonValue;
    recipients?: string[];
    excludeActor?: boolean;
  }): Promise<void> {
    // 1️⃣ Determine recipients
    let recipients: string[];

    if (params.recipients?.length) {
      recipients = params.recipients;
    } else {
      const memberIds = await this.getActiveGroupMemberIds(params.groupId);
      recipients = params.excludeActor
        ? memberIds.filter((id) => id !== params.actorId)
        : memberIds;
    }

    if (!recipients.length) return;

    // 2️⃣ Persist activity entries (DB is source of truth)
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

    // 3️⃣ Send push notifications
    try {
      const tokens =
        await this.deviceTokenService.getTokensForUsers(recipients);

      if (!tokens.length) return;

      await this.firebaseService.sendPushNotification(
        tokens,
        'New activity in your group',
        params.title,
        {
          type: params.type,
          groupId: params.groupId,
          actorId: params.actorId,
          title: params.title,
          url: `/groups/${params.groupId}/activity`,
        },
      );

      this.logger.log(
        `FCM sent | group=${params.groupId} | recipients=${recipients.length} | tokens=${tokens.length}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send FCM for group ${params.groupId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  // ---------------- Helpers ----------------
  private async getActiveGroupMemberIds(groupId: string): Promise<string[]> {
    const members = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        leftAt: null,
      },
      select: {
        userId: true,
      },
    });

    return members.map((m) => m.userId);
  }
}
