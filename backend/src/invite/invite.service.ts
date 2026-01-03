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
    if (!userId) {
      throw new BadRequestException('User must be logged in to accept invite');
    }

    if (!displayName?.trim()) {
      throw new BadRequestException('Display name is required');
    }

    const invite = await this.prisma.groupInvite.findUnique({
      where: { token },
      include: { group: true },
    });

    if (!invite) throw new NotFoundException('Invalid invite token');

    if (invite.status !== InviteStatus.PENDING)
      throw new BadRequestException('Invite already used');

    if (invite.expiresAt && invite.expiresAt < new Date())
      throw new BadRequestException('Invite has expired');

    // ✅ Check user exists before adding to group
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Authenticated user not found');
    }

    // Check if user is already a member
    const existing = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId: invite.groupId } },
    });

    if (!existing) {
      await this.prisma.groupMember.create({
        data: {
          userId,
          groupId: invite.groupId,
          role: 'MEMBER',
          displayName,
        },
      });
    }

    // Mark invite as accepted
    await this.prisma.groupInvite.update({
      where: { id: invite.id },
      data: { status: InviteStatus.ACCEPTED },
    });

    return { groupId: invite.groupId };
  }
}
