import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupRole, GroupMember, GroupInvite } from '@prisma/client';
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
          create: { userId, role: GroupRole.ADMIN },
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
          },
        },
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
  async findOne(groupId: string) {
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

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      members: group.members.map((m) => ({
        id: m.user.id,
        name: m.user.name ?? m.displayName,
        email: m.user.email,
      })),
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
      // Existing user → in-app invite
      const existingMembership = await this.prisma.groupMember.findUnique({
        where: { userId_groupId: { userId: user.id, groupId } },
      });

      if (existingMembership && existingMembership.leftAt === null) {
        throw new ConflictException('User already in group');
      }

      const member = existingMembership
        ? await this.prisma.groupMember.update({
            where: { id: existingMembership.id },
            data: { leftAt: null },
          })
        : await this.prisma.groupMember.create({
            data: {
              userId: user.id,
              groupId,
              role: GroupRole.MEMBER,
            },
          });

      await this.prisma.groupMemberNotification.create({
        data: { groupId, userId: user.id },
      });

      return member;
    }

    // New user → email invite
    const token = generateSecureToken();

    const invite = await this.prisma.groupInvite.create({
      data: {
        groupId,
        email: normalizedEmail,
        token,
      },
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
  async removeMember(
    groupId: string,
    userId: string,
    requestingUserId: string,
  ) {
    const admins = await this.prisma.groupMember.findMany({
      where: { groupId, role: GroupRole.ADMIN, leftAt: null },
    });

    if (admins.length === 1 && admins[0].userId === userId) {
      throw new BadRequestException(
        'Cannot remove the last admin. Transfer admin role first.',
      );
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (!membership || membership.leftAt !== null) {
      throw new NotFoundException('User is not a member of this group');
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
