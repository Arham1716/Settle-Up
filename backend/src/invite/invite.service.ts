import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteStatus } from '@prisma/client';
import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class InviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  /**
   * PUBLIC
   * Verify invite token
   */
  async verifyInvite(token: string) {
    const invite = await this.prisma.groupInvite.findUnique({
      where: { token },
      include: { group: true },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite link');
    }

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Invite already used');
    }

    // Optional expiry check
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    return {
      groupId: invite.groupId,
      email: invite.email,
      groupName: invite.group.name,
    };
  }

  /**
   * PROTECTED
   * Accept invite and add user to group
   */
  async acceptInvite(token: string, userId: string, displayName: string) {
    console.log('[ACCEPT_INVITE] Start', { token, userId });

    const invite = await this.prisma.groupInvite.findUnique({
      where: { token },
      include: { group: true },
    });

    if (!invite) throw new NotFoundException('Invalid invite token');

    if (invite.status !== InviteStatus.PENDING)
      throw new BadRequestException('Invite already used');

    if (invite.expiresAt && invite.expiresAt < new Date())
      throw new BadRequestException('Invite has expired');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Authenticated user not found');
    }

    console.log('[ACCEPT_INVITE] User', user.email);

    let membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId: invite.groupId,
        },
      },
    });

    let isNewJoin = false;

    if (!membership) {
      membership = await this.prisma.groupMember.create({
        data: {
          userId,
          groupId: invite.groupId,
          role: 'MEMBER',
          displayName,
        },
      });
      isNewJoin = true;
      console.log('[ACCEPT_INVITE] Membership created');

    } else if (membership.leftAt !== null) {
      membership = await this.prisma.groupMember.update({
        where: { id: membership.id },
        data: {
          leftAt: null,
          displayName,
        },
      });
      isNewJoin = true;
      console.log('[ACCEPT_INVITE] Membership reactivated');
    }

    // Mark invite accepted
    await this.prisma.groupInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.ACCEPTED },
    });

    console.log('[ACCEPT_INVITE] Invite accepted');

    // 🔥 Activity logging
    if (isNewJoin) {
      const members = await this.prisma.groupMember.findMany({
        where: { groupId: invite.groupId, leftAt: null },
        select: { userId: true },
      });

      await this.activityService.logGroupActivity({
        actorId: userId,
        groupId: invite.groupId,
        type: ActivityType.MEMBER_ADDED,
        title: `${displayName} joined the group using invite`,
        metadata: {
          userId,
          inviteId: invite.id,
        },
        recipients: members.map((m) => m.userId),
      });

      console.log('[ACCEPT_INVITE] Logged MEMBER_ADDED');
    }

    return { groupId: invite.groupId };
  }
}
