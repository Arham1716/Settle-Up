import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreatePersonalExpenseDto } from './dto/create-personal-expense.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { AlertService } from './alert.service';

@Injectable()
export class BudgetService {
  private readonly logger = new Logger(BudgetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertService: AlertService,
  ) {}

  // ---------------- Create Budget ----------------
  async create(userId: string, dto: CreateBudgetDto) {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);

    if (periodStart >= periodEnd) {
      throw new BadRequestException('periodStart must be before periodEnd');
    }

    // Check for overlapping budgets
    const overlapping = await this.prisma.budget.findFirst({
      where: {
        userId,
        OR: [
          {
            periodStart: { lte: periodEnd },
            periodEnd: { gte: periodStart },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        'A budget already exists for this time period',
      );
    }

    // Validate total amount matches sum of categories
    const categoriesTotal = dto.categories.reduce(
      (sum, cat) => sum + cat.allocatedAmount,
      0,
    );

    if (Math.abs(categoriesTotal - dto.totalAmount) > 0.01) {
      throw new BadRequestException(
        'Total amount must equal the sum of category amounts',
      );
    }

    const budget = await this.prisma.budget.create({
      data: {
        userId,
        periodStart,
        periodEnd,
        totalAmount: dto.totalAmount,
        categories: {
          create: dto.categories.map((cat) => ({
            name: cat.name,
            allocatedAmount: cat.allocatedAmount,
          })),
        },
      },
      include: {
        categories: true,
      },
    });

    return {
      ...budget,
      totalAmount: Number(budget.totalAmount),
      categories: budget.categories.map((cat) => ({
        ...cat,
        allocatedAmount: Number(cat.allocatedAmount),
      })),
    };
  }

  // ---------------- Get All Budgets for User ----------------
  async findAll(userId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { userId },
      include: {
        categories: true,
      },
      orderBy: { periodStart: 'desc' },
    });

    const result = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.calculateSpent(userId, budget.id);
        const total = Number(budget.totalAmount);
        return {
          ...budget,
          totalAmount: total,
          spent,
          remaining: total - spent,
          percentageUsed: total > 0 ? (spent / total) * 100 : 0,
          categories: budget.categories.map((cat) => ({
            ...cat,
            allocatedAmount: Number(cat.allocatedAmount),
          })),
        };
      }),
    );
    return result;
  }

  // ---------------- Get Active Budget ----------------
  async getActiveBudget(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setUTCHours(23, 59, 59, 999);
    const budget = await this.prisma.budget.findFirst({
      where: {
        userId,
        periodStart: { lte: endOfToday },
        periodEnd: { gte: startOfToday },
      },
      include: {
        categories: true,
      },
    });

    if (!budget) {
      return null;
    }

    const spent = await this.calculateSpent(userId, budget.id);
    const categorySpent = await this.calculateCategorySpent(
      userId,
      budget.id,
    );

    return {
      ...budget,
      totalAmount: Number(budget.totalAmount),
      spent,
      remaining: Number(budget.totalAmount) - spent,
      percentageUsed: (spent / Number(budget.totalAmount)) * 100,
      categories: budget.categories.map((cat) => {
        const catSpent = categorySpent[cat.name] || 0;
        return {
          ...cat,
          allocatedAmount: Number(cat.allocatedAmount),
          spent: catSpent,
          remaining: Number(cat.allocatedAmount) - catSpent,
          percentageUsed:
            (catSpent / Number(cat.allocatedAmount)) * 100,
        };
      }),
    };
  }

  // ---------------- Get Budget by ID ----------------
  async findOne(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
      include: {
        categories: true,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const spent = await this.calculateSpent(userId, budget.id);
    const categorySpent = await this.calculateCategorySpent(
      userId,
      budget.id,
    );
    const expenses = await this.getBudgetExpenses(userId, budget.id);

    return {
      ...budget,
      totalAmount: Number(budget.totalAmount),
      spent,
      remaining: Number(budget.totalAmount) - spent,
      percentageUsed: (spent / Number(budget.totalAmount)) * 100,
      categories: budget.categories.map((cat) => {
        const catSpent = categorySpent[cat.name] || 0;
        return {
          ...cat,
          allocatedAmount: Number(cat.allocatedAmount),
          spent: catSpent,
          remaining: Number(cat.allocatedAmount) - catSpent,
          percentageUsed:
            (catSpent / Number(cat.allocatedAmount)) * 100,
        };
      }),
      expenses,
    };
  }

  // ---------------- Get expenses that count toward a budget ----------------
  async getBudgetExpenses(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });
    if (!budget) return [];

    const expenses = await this.prisma.expense.findMany({
      where: {
        paidById: userId,
        createdAt: {
          gte: budget.periodStart,
          lte: budget.periodEnd,
        },
        OR: [
          { type: 'PERSONAL' },
          {
            type: 'GROUP',
            group: {
              members: {
                some: {
                  userId,
                  leftAt: null,
                },
              },
            },
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        group: { select: { name: true } },
      },
    });

    return expenses.map((e) => ({
      id: e.id,
      description: e.description,
      amount: Number(e.amount),
      category: e.category,
      type: e.type,
      createdAt: e.createdAt,
      groupName: e.group?.name,
    }));
  }

  // ---------------- Update Budget ----------------
  async update(userId: string, budgetId: string, dto: UpdateBudgetDto) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    const updateData: any = {};

    if (dto.periodStart && dto.periodEnd) {
      const periodStart = new Date(dto.periodStart);
      const periodEnd = new Date(dto.periodEnd);

      if (periodStart >= periodEnd) {
        throw new BadRequestException('periodStart must be before periodEnd');
      }

      // Check for overlapping budgets (excluding current)
      const overlapping = await this.prisma.budget.findFirst({
        where: {
          userId,
          id: { not: budgetId },
          OR: [
            {
              periodStart: { lte: periodEnd },
              periodEnd: { gte: periodStart },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          'Another budget already exists for this time period',
        );
      }

      updateData.periodStart = periodStart;
      updateData.periodEnd = periodEnd;
    }

    if (dto.totalAmount !== undefined) {
      updateData.totalAmount = dto.totalAmount;
    }

    if (dto.categories) {
      // Delete existing categories and create new ones
      await this.prisma.budgetCategory.deleteMany({
        where: { budgetId },
      });

      updateData.categories = {
        create: dto.categories.map((cat) => ({
          name: cat.name,
          allocatedAmount: cat.allocatedAmount,
        })),
      };
    }

    const updated = await this.prisma.budget.update({
      where: { id: budgetId },
      data: updateData,
      include: {
        categories: true,
      },
    });

    return {
      ...updated,
      totalAmount: Number(updated.totalAmount),
      categories: updated.categories.map((cat) => ({
        ...cat,
        allocatedAmount: Number(cat.allocatedAmount),
      })),
    };
  }

  // ---------------- Delete Budget ----------------
  async remove(userId: string, budgetId: string) {
    const budget = await this.prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    await this.prisma.budget.delete({
      where: { id: budgetId },
    });

    return { message: 'Budget deleted successfully' };
  }

  // ---------------- Calculate Total Spent for Budget ----------------
  async calculateSpent(userId: string, budgetId: string): Promise<number> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      return 0;
    }

    // Get all expenses (personal + group expenses where user is a member)
    // within the budget period
    const expenses = await this.prisma.expense.findMany({
      where: {
        paidById: userId,
        createdAt: {
          gte: budget.periodStart,
          lte: budget.periodEnd,
        },
        OR: [
          { type: 'PERSONAL' },
          {
            type: 'GROUP',
            group: {
              members: {
                some: {
                  userId,
                  leftAt: null,
                },
              },
            },
          },
        ],
      },
    });

    const total = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount),
      0,
    );

    return total;
  }

  // ---------------- Calculate Spent per Category ----------------
  async calculateCategorySpent(
    userId: string,
    budgetId: string,
  ): Promise<Record<string, number>> {
    const budget = await this.prisma.budget.findUnique({
      where: { id: budgetId },
      include: { categories: true },
    });

    if (!budget) {
      return {};
    }

    const categoryNames = budget.categories.map((cat) => cat.name);
    const spentByCategory: Record<string, number> = {};

    // Initialize all categories to 0
    categoryNames.forEach((name) => {
      spentByCategory[name] = 0;
    });

    // Get expenses within budget period
    const expenses = await this.prisma.expense.findMany({
      where: {
        paidById: userId,
        createdAt: {
          gte: budget.periodStart,
          lte: budget.periodEnd,
        },
        OR: [
          { type: 'PERSONAL' },
          {
            type: 'GROUP',
            group: {
              members: {
                some: {
                  userId,
                  leftAt: null,
                },
              },
            },
          },
        ],
        category: { in: categoryNames },
      },
    });

    // Sum expenses by category
    expenses.forEach((exp) => {
      if (exp.category && categoryNames.includes(exp.category)) {
        spentByCategory[exp.category] += Number(exp.amount);
      }
    });

    return spentByCategory;
  }

  // ---------------- Track Expense Against Budgets ----------------
  async trackExpense(
    userId: string,
    amount: number,
    category?: string,
    expenseDate?: Date,
  ) {
    const date = expenseDate || new Date();

    // Find all active budgets for this user that include this date
    const activeBudgets = await this.prisma.budget.findMany({
      where: {
        userId,
        periodStart: { lte: date },
        periodEnd: { gte: date },
      },
      include: {
        categories: true,
      },
    });

    // Check each budget and trigger alerts if needed
    for (const budget of activeBudgets) {
      const spent = await this.calculateSpent(userId, budget.id);
      const totalAmount = Number(budget.totalAmount);
      const percentage = (spent / totalAmount) * 100;

      // Check overall budget threshold
      await this.alertService.checkBudgetThreshold(
        userId,
        budget.id,
        null,
        spent,
        totalAmount,
        percentage,
      );

      // Check category threshold if category is provided
      if (category) {
        const categoryBudget = budget.categories.find(
          (cat) => cat.name === category,
        );
        if (categoryBudget) {
          const categorySpent = await this.calculateCategorySpent(
            userId,
            budget.id,
          );
          const catSpent = categorySpent[category] || 0;
          const catAllocated = Number(categoryBudget.allocatedAmount);
          const catPercentage = (catSpent / catAllocated) * 100;

          await this.alertService.checkBudgetThreshold(
            userId,
            budget.id,
            categoryBudget.id,
            catSpent,
            catAllocated,
            catPercentage,
          );
        }
      }
    }
  }

  // ---------------- Create Personal Expense ----------------
  async createPersonalExpense(
    userId: string,
    dto: CreatePersonalExpenseDto,
  ) {
    const expense = await this.prisma.expense.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        paidById: userId,
        type: 'PERSONAL',
        category: dto.category || null,
        groupId: null,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Track expense against budgets
    await this.trackExpense(
      userId,
      dto.amount,
      dto.category,
      new Date(),
    );

    return {
      ...expense,
      amount: Number(expense.amount),
    };
  }

  // ---------------- Get Budget Summary for Dashboard ----------------
  async getBudgetSummary(userId: string) {
    const activeBudget = await this.getActiveBudget(userId);

    if (!activeBudget) {
      return {
        hasActiveBudget: false,
        activeBudget: null,
        recentAlerts: [],
      };
    }

    // Get recent alerts
    const recentAlerts = await this.prisma.budgetAlert.findMany({
      where: {
        userId,
        budgetId: activeBudget.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        budget: {
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
          },
        },
      },
    });

    return {
      hasActiveBudget: true,
      activeBudget,
      recentAlerts: recentAlerts.map((alert) => ({
        ...alert,
        createdAt: alert.createdAt.toISOString(),
      })),
    };
  }
}
