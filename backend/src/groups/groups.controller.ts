import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { GroupMemberGuard } from './guards/group-member.guard';
import { GroupAdminGuard } from './guards/group-admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/auth-request';

@Controller('groups')
@UseGuards(JwtAuthGuard) // Apply your auth guard to all routes
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateGroupDto) {
    return this.groupsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.groupsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  //@UseGuards(GroupMemberGuard)
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(GroupAdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(GroupAdminGuard)
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  // Member management
  @Post(':id/members')
  @UseGuards(GroupAdminGuard)
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.groupsService.addMember(id, dto.email);
  }

  @Delete(':id/members/:userId')
  @UseGuards(GroupAdminGuard)
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.groupsService.removeMember(id, userId, req.user.id);
  }

  @Patch(':id/members/:userId')
  @UseGuards(GroupAdminGuard)
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.groupsService.updateMemberRole(
      id,
      userId,
      dto.role,
      req.user.id,
    );
  }

  // Balances
  @Get(':id/balances')
  @UseGuards(GroupMemberGuard)
  getBalances(@Param('id') id: string) {
    return this.groupsService.getBalances(id);
  }

  @Get('invite/:inviteToken')
  async acceptInvite(@Param('inviteToken') inviteToken: string) {
    const group = await this.groupsService.getGroupByInviteToken(inviteToken);
    if (!group) throw new NotFoundException('Invalid invite link');

    return { groupId: group.id };
  }
}
