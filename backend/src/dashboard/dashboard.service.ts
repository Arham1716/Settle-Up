import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Decimal } from "@prisma/client/runtime/library";
import { BudgetService } from "../budget/budget.service";

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => BudgetService))
    private readonly budgetService: BudgetService,
  ) {}

  async getDashboardData(userId: string) {
    // 1️⃣ Total groups user belongs to
    const totalGroups = await this.prisma.groupMember.count({
      where: {
        userId,
        leftAt: null,
      },
    });

    // 2️⃣ Outstanding balance (sum of all BalanceSplits for user)
    const balanceAgg = await this.prisma.balanceSplit.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId,
      },
    });

    const outstandingBalance =
      balanceAgg._sum.amount instanceof Decimal
        ? balanceAgg._sum.amount.toNumber()
        : 0;

    // 3️⃣ Recent activity (expenses in user's groups, last 7 days)
    const recentActivity = await this.prisma.expense.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        group: {
          members: {
            some: {
              userId,
              leftAt: null,
            },
          },
        },
      },
    });

    // 4️⃣ Budget summary
    const budgetSummary = await this.budgetService.getBudgetSummary(userId);

    return {
      totalGroups,
      outstandingBalance,
      recentActivity,
      budgetSummary,
    };
  }
}
