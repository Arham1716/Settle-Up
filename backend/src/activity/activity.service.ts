import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityType, Prisma } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async getUserActivity(userId: string) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
        group: {
          select: { id: true, name: true },
        },
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
    let recipients: string[];

    if (params.recipients) {
      recipients = params.recipients;
    } else {
      const memberIds = await this.getActiveGroupMemberIds(params.groupId);
      recipients = params.excludeActor
        ? memberIds.filter((id) => id !== params.actorId)
        : memberIds;
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
  }

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
