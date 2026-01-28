import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { UpdateGroupSettingsDto } from './dto/update-group-settings.dto';
import {
  ContactSupportDto,
  FeatureRequestDto,
  BugReportDto,
} from './dto/support-message.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // ---------------- Account Settings ----------------
  async getAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateAccount(userId: string, dto: UpdateAccountDto) {
    const updateData: any = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }

    if (dto.email !== undefined) {
      // Check if email is already taken by another user
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existing && existing.id !== userId) {
        throw new BadRequestException('Email already in use');
      }

      updateData.email = dto.email.toLowerCase().trim();
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }

  async deleteAccount(userId: string) {
    // Hard delete - permanently remove user
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }

  // ---------------- Preferences ----------------
  // Note: Preferences are stored in-memory for now (schema was reverted)
  // In production, you would need to add UserPreferences model back to schema
  private preferencesCache = new Map<string, any>();

  async getPreferences(userId: string) {
    const cached = this.preferencesCache.get(userId);
    if (cached) {
      return cached;
    }

    // Return default preferences
    const defaults = {
      defaultCurrency: 'USD',
      numberFormat: '1000',
      language: 'en',
    };
    this.preferencesCache.set(userId, defaults);
    return defaults;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const current = await this.getPreferences(userId);
    const updated = {
      ...current,
      ...dto,
    };
    this.preferencesCache.set(userId, updated);
    return updated;
  }

  // ---------------- Notification Settings ----------------
  // Note: Notification settings are stored in-memory for now (schema was reverted)
  // In production, you would need to add UserNotificationSettings model back to schema
  private notificationSettingsCache = new Map<string, any>();

  async getNotificationSettings(userId: string) {
    const cached = this.notificationSettingsCache.get(userId);
    if (cached) {
      return cached;
    }

    // Return default settings
    const defaults = {
      groupEvents: true,
      expenseEvents: true,
      inviteEvents: true,
      paymentDueEvents: true,
      paymentReminderFrequency: 'weekly',
      doNotDisturbFrom: null,
      doNotDisturbTo: null,
      doNotDisturbAlways: false,
    };
    this.notificationSettingsCache.set(userId, defaults);
    return defaults;
  }

  async updateNotificationSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ) {
    const current = await this.getNotificationSettings(userId);
    const updated = {
      ...current,
      ...dto,
    };
    this.notificationSettingsCache.set(userId, updated);
    return updated;
  }

  // ---------------- Group Settings ----------------
  async getGroupSettings(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: {
        id: true,
        name: true,
        description: true,
        currency: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return {
      group,
      role: membership.role,
      notificationsPaused: false, // Schema was reverted, using default
    };
  }

  async updateGroupSettings(
    groupId: string,
    userId: string,
    dto: UpdateGroupSettingsDto,
  ) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    if (membership.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can update group settings');
    }

    // Remove defaultSplitType if present (schema was reverted)
    const { defaultSplitType, ...updateData } = dto as any;

    return this.prisma.group.update({
      where: { id: groupId },
      data: updateData,
    });
  }

  async toggleGroupNotifications(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Schema was reverted - notificationsPaused field doesn't exist
    // Return success but note that this feature requires schema update
    return {
      id: membership.id,
      notificationsPaused: false,
      message: 'Notification toggle requires schema update',
    };
  }

  async leaveGroup(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Check if user is the last admin
    if (membership.role === 'ADMIN') {
      const adminCount = await this.prisma.groupMember.count({
        where: {
          groupId,
          role: 'ADMIN',
          leftAt: null,
        },
      });

      if (adminCount === 1) {
        throw new BadRequestException(
          'Cannot leave group as the last admin. Transfer admin role first or delete the group.',
        );
      }
    }

    return this.prisma.groupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    });
  }

  async changeMemberRole(
    groupId: string,
    targetUserId: string,
    newRole: 'ADMIN' | 'MEMBER',
    requestingUserId: string,
  ) {
    // Verify requester is admin
    const requesterMembership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId: requestingUserId, groupId },
      },
    });

    if (
      !requesterMembership ||
      requesterMembership.leftAt !== null ||
      requesterMembership.role !== 'ADMIN'
    ) {
      throw new ForbiddenException('Only admins can change member roles');
    }

    // Prevent demoting the last admin
    if (newRole === 'MEMBER') {
      const adminCount = await this.prisma.groupMember.count({
        where: {
          groupId,
          role: 'ADMIN',
          leftAt: null,
        },
      });

      if (adminCount === 1) {
        const targetMembership = await this.prisma.groupMember.findUnique({
          where: {
            userId_groupId: { userId: targetUserId, groupId },
          },
        });

        if (targetMembership?.role === 'ADMIN') {
          throw new BadRequestException(
            'Cannot demote the last admin. Promote another member first.',
          );
        }
      }
    }

    return this.prisma.groupMember.update({
      where: {
        userId_groupId: { userId: targetUserId, groupId },
      },
      data: { role: newRole },
    });
  }

  // ---------------- Support ----------------
  async sendContactSupport(dto: ContactSupportDto) {
    const subject = `Support Request from ${dto.name}`;
    const message = `
Name: ${dto.name}
Email: ${dto.email}

Message:
${dto.message}
    `;

    await this.mailService.sendSupportEmail(
      'arham17.mail@gmail.com',
      subject,
      message,
    );

    return { message: 'Support request sent successfully' };
  }

  async sendFeatureRequest(dto: FeatureRequestDto, userEmail: string) {
    const subject = `Feature Request: ${dto.title}`;
    const message = `
Requested by: ${userEmail}

Title: ${dto.title}

Description:
${dto.description}
    `;

    await this.mailService.sendSupportEmail(
      'arham17.mail@gmail.com',
      subject,
      message,
    );

    return { message: 'Feature request submitted successfully' };
  }

  async sendBugReport(dto: BugReportDto) {
    const subject = `Bug Report from ${dto.name}`;
    const message = `
Name: ${dto.name}
Email: ${dto.email}

Bug Description:
${dto.description}
    `;

    await this.mailService.sendSupportEmail(
      'arham17.mail@gmail.com',
      subject,
      message,
    );

    return { message: 'Bug report submitted successfully' };
  }
}
