import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupRole, GroupMember, GroupInvite, NotificationStatus } from '@prisma/client';
import { generateSecureToken } from '../common/utils/token';
import { MailService } from '../mail/mail.service';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // ---------------- Create Group ----------------
  async create(userId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({
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
      (m) => m.userId === currentUserId && m.leftAt === null
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
  async remove(groupId: string) {
    return this.prisma.group.update({
      where: { id: groupId },
      data: { deletedAt: new Date() },
    });
  }

  // ---------------- Add Member ----------------
  async addMember(groupId: string, email: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Find any membership (active or previously removed) using findUnique since there's a unique constraint
      let membership = await this.prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
        include: { user: true }, // ensure user is included
      });

      if (membership) {
        if (membership.leftAt === null) {
          throw new ConflictException('User already in group');
        }

        // Reactivate removed member
        membership = await this.prisma.groupMember.update({
          where: { id: membership.id },
          data: {
            leftAt: null,
            role: GroupRole.MEMBER,
          },
          include: { user: true }, // include user
        });
      } else {
        // Create new membership
        membership = await this.prisma.groupMember.create({
          data: {
            userId: user.id,
            groupId,
            role: GroupRole.MEMBER,
          },
          include: { user: true },
        });
      }

      // Create notification (check if it exists first to avoid duplicates)
      const existingNotification = await this.prisma.groupMemberNotification.findFirst({
        where: { groupId, userId: user.id },
      });
      
      if (!existingNotification) {
        await this.prisma.groupMemberNotification.create({
          data: { groupId, userId: user.id },
        });
      } else {
        // Update existing notification to pending if it was declined
        await this.prisma.groupMemberNotification.update({
          where: { id: existingNotification.id },
          data: { status: NotificationStatus.PENDING },
        });
      }

      return membership;
    }

    // For new user → create invite
    const token = generateSecureToken();

    const invite = await this.prisma.groupInvite.create({
      data: { groupId, email: normalizedEmail, token },
      include: { group: true },
    });

    await this.mailService.sendGroupInviteEmail(
      normalizedEmail,
      invite.group.name,
      token,
    );

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
