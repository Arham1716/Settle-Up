import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteStatus } from '@prisma/client';

@Injectable()
export class InviteService {
  constructor(private readonly prisma: PrismaService) {}

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
    const invite = await this.prisma.groupInvite.findUnique({
      where: { token },
      include: { group: true },
    });

    if (!invite) throw new Error('Invalid invite token');
    if (invite.status !== 'PENDING') throw new Error('Invite already used');
    if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error('Invite expired');

    if (!displayName || !displayName.trim()) {
      throw new BadRequestException('Display name is required');
    }

    // Add the user to the group
    const existing = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: invite.groupId } },
    });

    if (!existing) {
      await this.prisma.groupMember.create({
        data: {
          userId,
          groupId: invite.groupId,
          role: 'MEMBER',
          displayName, // <-- set the name from input
        },
      });
    }

    await this.prisma.groupInvite.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    });

    return { groupId: invite.groupId };
  }
}
