import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import {
  GroupRole,
  GroupMember,
  GroupInvite,
  NotificationStatus,
} from '@prisma/client';
import { generateSecureToken } from '../common/utils/token';
import { MailService } from '../mail/mail.service';
import { ActivityService } from '../activity/activity.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private activityService: ActivityService,
  ) {}

  // ---------------- Create Group ----------------
  async create(userId: string, dto: CreateGroupDto) {
    const group = await this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        currency: dto.currency || 'USD',
        createdById: userId,
        members: {
          create: {
            userId,
            role: GroupRole.ADMIN,
            displayName: dto.displayName,
          },
        },
      },
      include: {
        members: {
          where: { leftAt: null },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
    await this.activityService.logGroupActivity({
      actorId: userId,
      groupId: group.id,
      type: 'GROUP_CREATED',
      title: `Group "${group.name}" was created`,
    });

    return {
      id: group.id,
      name: group.name,
    };
  }

  // ---------------- Get All Groups for User ----------------
  async findAllForUser(userId: string) {
    const groups = await this.prisma.group.findMany({
      where: {
        members: {
          some: {
            userId,
            leftAt: null, // Only include active memberships
          },
        },
        deletedAt: null, // Also exclude deleted groups
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
    return groups;
  }

  // ---------------- Get Single Group ----------------
  async findOne(groupId: string, currentUserId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!group) return null;

    // Map members and filter active members
    const activeMembers = group.members
      .filter((m) => m.leftAt === null)
      .map((m) => ({
        id: m.user.id,
        name: m.displayName || m.user.name || 'No Name',
        email: m.user.email,
        role: m.role,
      }));

    // Get current user's role (even if they were removed, fallback to null)
    const currentMembership = group.members.find(
      (m) => m.userId === currentUserId && m.leftAt === null,
    );
    const currentUserRole = currentMembership?.role || null;

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      currentUserRole,
      members: activeMembers,
    };
  }

  // ---------------- Update Group ----------------
  async update(groupId: string, dto: UpdateGroupDto) {
    return this.prisma.group.update({
      where: { id: groupId },
      data: dto,
      include: {
        members: {
          where: { leftAt: null },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });
  }

  // ---------------- Soft Delete Group ----------------
  async remove(groupId: string, actorId: string) {
    // Optional: ensure no outstanding balances
    const expenses = await this.prisma.expense.aggregate({
      where: { groupId },
      _sum: { amount: true },
    });

    const total = Number(expenses._sum.amount ?? 0);

    if (total > 0) {
      throw new BadRequestException(
        'Settle all balances before deleting the group',
      );
    }

    const members = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        leftAt: null,
      },
      select: { userId: true },
    });

    const group = await this.prisma.group.update({
      where: { id: groupId },
      data: { deletedAt: new Date() },
    });

    await this.activityService.logGroupActivity({
      actorId,
      groupId,
      type: ActivityType.GROUP_DELETED,
      title: `Group "${group.name}" was deleted`,
      recipients: members.map((m) => m.userId),
    });
  }

  // ---------------- Group Leave Member ----------------
  async leaveGroup(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership || membership.leftAt) {
      throw new NotFoundException('You are not part of this group');
    }

    // Prevent last admin from leaving
    if (membership.role === GroupRole.ADMIN) {
      const adminCount = await this.prisma.groupMember.count({
        where: {
          groupId,
          role: GroupRole.ADMIN,
          leftAt: null,
        },
      });

      if (adminCount === 1) {
        throw new BadRequestException(
          'Transfer admin role before leaving the group',
        );
      }
    }

    const activeMembers = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        leftAt: null,
      },
      select: { userId: true },
    });

    await this.activityService.logGroupActivity({
      actorId: userId,
      groupId,
      type: ActivityType.MEMBER_LEFT,
      title: `A member left the group`,
      metadata: {
        leftUserId: userId,
      },
      recipients: activeMembers
        .map((m) => m.userId)
        .filter((id) => id !== userId), // don't notify the leaver
    });

    return this.prisma.groupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    });
  }

  // ---------------- Check if Admin Can Leave ----------------
  async canAdminLeave(groupId: string, adminUserId: string): Promise<{ canLeave: boolean; reason?: string }> {
    // Verify admin membership
    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: adminUserId, groupId } },
    });

    if (!membership || membership.leftAt !== null || membership.role !== GroupRole.ADMIN) {
      return { canLeave: false, reason: 'User is not an active admin' };
    }

    // Check for pending balances
    const totalPending = await this.prisma.expense.aggregate({
      where: { groupId },
      _sum: { amount: true },
    });

    if (Number(totalPending._sum.amount ?? 0) > 0) {
      return { canLeave: false, reason: 'There are pending expenses in this group' };
    }

    // Check if this is the last admin
    const adminCount = await this.prisma.groupMember.count({
      where: { groupId, role: GroupRole.ADMIN, leftAt: null },
    });

    if (adminCount <= 1) {
      return { canLeave: false, reason: 'Transfer admin role before leaving' };
    }

    return { canLeave: true };
  }


  // ---------------- Leaving group as an Admin ----------------
  async leaveAsAdmin(
    groupId: string,
    adminUserId: string,
    newAdminUserId: string,
  ) {
    if (adminUserId === newAdminUserId) {
      throw new BadRequestException('You cannot assign yourself as admin');
    }

    // Step 0: Validate current admin
    const adminMembership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: adminUserId, groupId } },
    });

    if (!adminMembership || adminMembership.leftAt !== null) {
      throw new NotFoundException('Admin membership not found');
    }

    if (adminMembership.role !== GroupRole.ADMIN) {
      throw new BadRequestException('Only admins can perform this action');
    }

    // Step 1: Check for any pending balances in the group
    const unsettledSplits = await this.prisma.balanceSplit.findFirst({
      where: {
        groupId,
        amount: { not: 0 }, // any non-zero split indicates pending balance
      },
    });

    if (unsettledSplits) {
      throw new BadRequestException(
        'Cannot leave the group. There are pending expenses that must be settled first.',
      );
    }

    // Step 2: Validate new admin
    const newAdminMembership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId: newAdminUserId, groupId } },
    });

    if (!newAdminMembership || newAdminMembership.leftAt !== null) {
      throw new BadRequestException('Selected user is not an active member');
    }

    return this.prisma.$transaction(async (tx) => {
      // 3. Promote new admin
      await tx.groupMember.update({
        where: { id: newAdminMembership.id },
        data: { role: GroupRole.ADMIN },
      });

      // 4. Demote + remove current admin
      await tx.groupMember.update({
        where: { id: adminMembership.id },
        data: {
          role: GroupRole.MEMBER,
          leftAt: new Date(),
        },
      });

      // 5. Activity log
      await this.activityService.logGroupActivity({
        actorId: adminUserId,
        groupId,
        type: ActivityType.ADMIN_TRANSFERRED,
        title: 'Admin role transferred and admin left the group',
        metadata: {
          fromAdminId: adminUserId,
          toAdminId: newAdminUserId,
        },
      });

      return { success: true };
    });
  }

  // ---------------- Add Member ----------------
  async addMember(groupId: string, email: string, actorId: string) {
    console.log('[ADD_MEMBER] Start', { groupId, email, actorId });

    const previousMembers = await this.prisma.groupMember.findMany({
      where: { groupId, leftAt: null },
      select: { userId: true },
    });

    console.log('[ADD_MEMBER] Active members', previousMembers);

    const normalizedEmail = email.toLowerCase().trim();

    // Check if already invited
    const existingInvite = await this.prisma.groupInvite.findFirst({
      where: {
        groupId,
        email: normalizedEmail,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      throw new ConflictException('User already invited');
    }

    console.log('[ADD_MEMBER] Creating invite');

    const token = generateSecureToken();

    const invite = await this.prisma.groupInvite.create({
      data: {
        groupId,
        email: normalizedEmail,
        token,
      },
      include: { group: true },
    });

    console.log('[ADD_MEMBER] Invite created', invite.id);

    await this.mailService.sendGroupInviteEmail(
      normalizedEmail,
      invite.group.name,
      token,
    );

    console.log('[ADD_MEMBER] Invite email sent');

    // Log MEMBER_INVITED
    await this.activityService.logGroupActivity({
      actorId,
      groupId,
      type: ActivityType.MEMBER_INVITED,
      title: `${normalizedEmail} was invited to the group`,
      metadata: { inviteId: invite.id },
      recipients: previousMembers.map((m) => m.userId),
    });

    console.log('[ADD_MEMBER] Logged MEMBER_INVITED');

    return invite;
  }

  // ---------------- Remove Member ----------------
  async removeMember(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership || membership.leftAt !== null) {
      throw new NotFoundException('User is not a member of this group');
    }

    // Prevent removing the last admin
    if (membership.role === GroupRole.ADMIN) {
      const adminCount = await this.prisma.groupMember.count({
        where: {
          groupId,
          role: GroupRole.ADMIN,
          leftAt: null,
        },
      });

      if (adminCount === 1) {
        throw new BadRequestException(
          'Cannot remove the last admin. Transfer admin role first.',
        );
      }
    }
    await this.activityService.logGroupActivity({
      actorId: userId,
      groupId,
      type: ActivityType.MEMBER_REMOVED,
      title: `A member was removed from the group`,
      metadata: {
        removedUserId: userId,
      },
    });

    return this.prisma.groupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    });
  }

  // ---------------- Update Member Role ----------------
  async updateMemberRole(
    groupId: string,
    userId: string,
    role: GroupRole,
    requestingUserId: string,
  ) {
    if (role === GroupRole.MEMBER) {
      const admins = await this.prisma.groupMember.findMany({
        where: { groupId, role: GroupRole.ADMIN, leftAt: null },
      });
      if (admins.length === 1 && admins[0].userId === userId) {
        throw new BadRequestException(
          'Cannot demote the last admin. Promote another member first.',
        );
      }
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership || membership.leftAt !== null) {
      throw new NotFoundException('User is not a member of this group');
    }

    return this.prisma.groupMember.update({
      where: { id: membership.id },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  // ---------------- Get Group Balances ----------------
  async getBalances(groupId: string) {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId, leftAt: null },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return members.map((member) => ({
      user: member.user,
      balance: 0,
      owes: [],
      isOwed: [],
    }));
  }

  async getGroupByInviteToken(inviteToken: string) {
    const invite = await this.prisma.groupInvite.findUnique({
      where: { token: inviteToken },
      include: { group: true },
    });

    return invite?.group || null;
  }
}
