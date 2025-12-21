import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupRole } from '@prisma/client';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // Create a new group
  async create(userId: string, dto: CreateGroupDto) {
    return this.prisma.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        currency: dto.currency || 'USD',
        createdById: userId,
        // Automatically add creator as ADMIN
        members: {
          create: {
            userId,
            role: GroupRole.ADMIN,
          },
        },
      },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  // Get all groups for a user
  async findAllForUser(userId: string) {
    return this.prisma.group.findMany({
      where: {
        deletedAt: null,
        members: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            members: {
              where: { leftAt: null },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Get single group by ID
  async findOne(groupId: string) {
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  // Update group metadata
  async update(groupId: string, dto: UpdateGroupDto) {
    return this.prisma.group.update({
      where: { id: groupId },
      data: dto,
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  // Soft delete group
  async remove(groupId: string) {
    return this.prisma.group.update({
      where: { id: groupId },
      data: { deletedAt: new Date() },
    });
  }

  // Add member to group
  async addMember(groupId: string, email: string) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    // Check if user is already a member
    const existingMembership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId,
        },
      },
    });

    if (existingMembership) {
      if (existingMembership.leftAt === null) {
        throw new ConflictException('User is already a member of this group');
      }
      // Reactivate membership if user previously left
      return this.prisma.groupMember.update({
        where: { id: existingMembership.id },
        data: { leftAt: null, role: GroupRole.MEMBER },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    }

    return this.prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId,
        role: GroupRole.MEMBER,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // Remove member from group (soft delete)
  async removeMember(
    groupId: string,
    userId: string,
    requestingUserId: string) {
    // Prevent removing yourself if you're the last admin
    const admins = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        role: GroupRole.ADMIN,
        leftAt: null,
      },
    });

    if (admins.length === 1 && admins[0].userId === userId) {
      throw new BadRequestException(
        'Cannot remove the last admin. Transfer admin role first.',
      );
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new NotFoundException('User is not a member of this group');
    }

    return this.prisma.groupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    });
  }

  // Update member role
  async updateMemberRole(
    groupId: string,
    userId: string,
    role: GroupRole,
    requestingUserId: string) {
    // Prevent demoting yourself if you're the last admin
    if (role === GroupRole.MEMBER) {
      const admins = await this.prisma.groupMember.findMany({
        where: {
          groupId,
          role: GroupRole.ADMIN,
          leftAt: null,
        },
      });

      if (admins.length === 1 && admins[0].userId === userId) {
        throw new BadRequestException(
          'Cannot demote the last admin. Promote another member first.',
        );
      }
    }

    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new NotFoundException('User is not a member of this group');
    }

    return this.prisma.groupMember.update({
      where: { id: membership.id },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  // Get group balances (stub for now)
  async getBalances(groupId: string) {
    const members = await this.prisma.groupMember.findMany({
      where: { groupId, leftAt: null },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Return stub balances - will be implemented with Expenses module
    return members.map((member) => ({
      user: member.user,
      balance: 0,
      owes: [],
      isOwed: [],
    }));
  }
}
