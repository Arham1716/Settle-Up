import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreatePersonalExpenseDto } from './dto/create-personal-expense.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/types/auth-request';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Request() req: AuthenticatedRequest, @Body() dto: CreateBudgetDto) {
    return this.budgetService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.budgetService.findAll(req.user.id);
  }

  @Get('active')
  getActiveBudget(@Request() req: AuthenticatedRequest) {
    return this.budgetService.getActiveBudget(req.user.id);
  }

  @Get('summary')
  getSummary(@Request() req: AuthenticatedRequest) {
    return this.budgetService.getBudgetSummary(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.budgetService.findOne(req.user.id, id);
  }

  @Put(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetDto,
  ) {
    return this.budgetService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.budgetService.remove(req.user.id, id);
  }

  @Post('expenses/personal')
  createPersonalExpense(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePersonalExpenseDto,
  ) {
    return this.budgetService.createPersonalExpense(req.user.id, dto);
  }
}
