import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { GroupMemberGuard } from '../groups/guards/group-member.guard';
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
  getBalance(@Param('groupId') groupId: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.getGroupBalance(groupId, req.user.id);
  }

  @Get()
  findAll(@Param('groupId') groupId: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.findAllForGroup(groupId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.findOne(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.expensesService.remove(id, req.user.id);
  }
}

