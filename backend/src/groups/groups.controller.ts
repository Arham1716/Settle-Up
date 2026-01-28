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
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { ExpensesService } from '../expenses/expenses.service';
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
  constructor(
    private readonly groupsService: GroupsService,
    private readonly expensesService: ExpensesService,
  ) {}

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
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.groupsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @UseGuards(GroupAdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto) {
    return this.groupsService.update(id, dto);
  }

  //Group deletion option for Admin only
  @Delete(':id')
  @UseGuards(GroupAdminGuard)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.groupsService.remove(id, req.user.id);
  }

  //Leave group (members)
  @Delete(':id/leave')
  @UseGuards(GroupMemberGuard)
  leaveGroup(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.groupsService.leaveGroup(id, req.user.id);
  }

  //Leaving group (admin)
  @Post(':id/leave-as-admin')
  @UseGuards(GroupAdminGuard)
  leaveAsAdmin(
    @Param('id') groupId: string,
    @Body('newAdminUserId') newAdminUserId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.groupsService.leaveAsAdmin(
      groupId,
      req.user.id,
      newAdminUserId,
    );
  }

  // Member management
  @Post(':id/members')
  @UseGuards(GroupAdminGuard)
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.groupsService.addMember(id, dto.email, req.user.id);
  }

  @Delete(':id/members/:userId')
  @UseGuards(GroupAdminGuard)
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.groupsService.removeMember(id, userId);
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

  // Group Balance Summary
  @Get(':id/balance')
  @UseGuards(GroupMemberGuard)
  getBalance(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.getGroupBalance(id, req.user.id);
  }
}
