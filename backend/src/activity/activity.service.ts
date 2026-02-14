import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType, Prisma } from '@prisma/client';
import { FirebaseService } from '../firebase/firebase.service';
import { DeviceTokenService } from '../device-token/device-token.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly settingsService: SettingsService,
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

   async getUnseenCount(userId: string) {
    const count = await this.prisma.activity.count({
      where: {
        userId,
        seenAt: null,
      },
    });

    return { count };
  }

  async markAllSeen(userId: string) {
    await this.prisma.activity.updateMany({
      where: {
        userId,
        seenAt: null,
      },
      data: {
        seenAt: new Date(),
      },
    });

    return { success: true };
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

    this.logger.log(
      `logGroupActivity | group=${params.groupId} | type=${params.type} | actor=${params.actorId} | recipients=${recipients.join(
        ',',
      )}`,
    );

    if (!recipients.length) {
      this.logger.log(
        `logGroupActivity | group=${params.groupId} | type=${params.type} | no recipients, skipping`,
      );
      return;
    }

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

    try {
      const recipientChecks = await Promise.all(
        recipients.map(async (userId) => {
          const shouldSend =
            await this.settingsService.shouldSendActivityNotification(
              userId,
              params.type,
            );
          return { userId, shouldSend };
        }),
      );

      const pushRecipients = recipientChecks
        .filter((r) => r.shouldSend)
        .map((r) => r.userId);

      if (!pushRecipients.length) {
        this.logger.log(
          `logGroupActivity | group=${params.groupId} | type=${params.type} | no recipients after notification settings`,
        );
        return;
      }

      const [actor, group] = await this.prisma.$transaction([
        this.prisma.user.findUnique({
          where: { id: params.actorId },
          select: { id: true, name: true, email: true },
        }),
        this.prisma.group.findUnique({
          where: { id: params.groupId },
          select: { id: true, name: true },
        }),
      ]);

      const tokens =
        await this.deviceTokenService.getTokensForUsers(pushRecipients);

      if (!tokens.length) {
        this.logger.warn(
          `logGroupActivity | group=${params.groupId} | no FCM tokens for recipients=${recipients.join(
            ',',
          )}`,
        );
        return;
      }

      await this.firebaseService.sendPushNotification(
        tokens,
        group?.name
          ? `New activity in ${group.name}`
          : 'New activity in your group',
        params.title,
        {
          type: params.type,
          groupId: params.groupId,
          actorId: params.actorId,
          actorName: actor?.name || actor?.email || '',
          groupName: group?.name || '',
          title: params.title,
          url: `/dashboard/groups/group/${params.groupId}`,
        },
      );

      this.logger.log(
        `FCM sent | group=${params.groupId} | recipients=${pushRecipients.length} | tokens=${tokens.length}`,
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
