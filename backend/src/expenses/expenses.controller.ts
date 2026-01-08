import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { SplitBalanceDto } from './dto/split-balance.dto';
import { GroupMemberGuard } from '../groups/guards/group-member.guard';
import { GroupAdminGuard } from '../groups/guards/group-admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/auth-request';

@Controller('groups/:groupId/expenses')
@UseGuards(JwtAuthGuard, GroupMemberGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(groupId, req.user.id, dto);
  }

  @Get('balance')
  getBalance(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.getGroupBalance(groupId, req.user.id);
  }

  @Get('balances')
  getMemberBalances(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.getMemberBalances(groupId, req.user.id);
  }

  @Get('settlements')
  getWhoOwesWhom(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.getWhoOwesWhom(groupId, req.user.id);
  }

  @Get()
  findAll(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.expensesService.findAllForGroup(groupId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('groupId') groupId: string,
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(id, groupId, req.user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.remove(id, req.user.id);
  }

  @Post('split')
  @UseGuards(GroupAdminGuard)
  splitBalance(
    @Param('groupId') groupId: string,
    @Request() req: AuthenticatedRequest,
    @Body() dto: SplitBalanceDto,
  ) {
    return this.expensesService.splitBalance(groupId, req.user.id, dto);
  }
}

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('expenses')
  getExpenseAnalytics(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.expensesService.getExpenseAnalytics(
      req.user.id,
      startDate,
      endDate,
    );
  }
}
