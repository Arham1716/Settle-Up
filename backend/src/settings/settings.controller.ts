import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingsService } from './settings.service';
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
import type { AuthenticatedRequest } from '../auth/types/auth-request';
import { GroupAdminGuard } from '../groups/guards/group-admin.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ---------------- Account Settings ----------------
  @Get('account')
  getAccount(@Request() req: AuthenticatedRequest) {
    return this.settingsService.getAccount(req.user.id);
  }

  @Patch('account')
  updateAccount(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.settingsService.updateAccount(req.user.id, dto);
  }

  @Patch('account/password')
  changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.settingsService.changePassword(req.user.id, dto);
  }

  @Delete('account')
  deleteAccount(@Request() req: AuthenticatedRequest) {
    return this.settingsService.deleteAccount(req.user.id);
  }

  // ---------------- Preferences ----------------
  @Get('preferences')
  getPreferences(@Request() req: AuthenticatedRequest) {
    return this.settingsService.getPreferences(req.user.id);
  }

  @Patch('preferences')
  updatePreferences(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.settingsService.updatePreferences(req.user.id, dto);
  }

  // ---------------- Notification Settings ----------------
  @Get('notifications')
  getNotificationSettings(@Request() req: AuthenticatedRequest) {
    return this.settingsService.getNotificationSettings(req.user.id);
  }

  @Patch('notifications')
  updateNotificationSettings(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.settingsService.updateNotificationSettings(req.user.id, dto);
  }

  // ---------------- Group Settings ----------------
  @Get('groups/:groupId')
  getGroupSettings(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.settingsService.getGroupSettings(groupId, req.user.id);
  }

  @Patch('groups/:groupId')
  @UseGuards(GroupAdminGuard)
  updateGroupSettings(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateGroupSettingsDto,
  ) {
    return this.settingsService.updateGroupSettings(groupId, req.user.id, dto);
  }

  @Post('groups/:groupId/notifications/toggle')
  toggleGroupNotifications(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.settingsService.toggleGroupNotifications(groupId, req.user.id);
  }

  @Post('groups/:groupId/leave')
  leaveGroup(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.settingsService.leaveGroup(groupId, req.user.id);
  }

  @Patch('groups/:groupId/members/:userId/role')
  @UseGuards(GroupAdminGuard)
  changeMemberRole(
    @Param('groupId') groupId: string,
    @Param('userId') userId: string,
    @Body() body: { role: 'ADMIN' | 'MEMBER' },
    @Request() req: AuthenticatedRequest,
  ) {
    return this.settingsService.changeMemberRole(
      groupId,
      userId,
      body.role,
      req.user.id,
    );
  }

  // ---------------- Support ----------------
  @Post('support/contact')
  contactSupport(@Body() dto: ContactSupportDto) {
    return this.settingsService.sendContactSupport(dto);
  }

  @Post('support/feature-request')
  featureRequest(
    @Request() req: AuthenticatedRequest,
    @Body() dto: FeatureRequestDto,
  ) {
    return this.settingsService.sendFeatureRequest(dto, req.user.email);
  }

  @Post('support/bug-report')
  bugReport(@Body() dto: BugReportDto) {
    return this.settingsService.sendBugReport(dto);
  }
}
