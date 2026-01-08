import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { SplitBalanceDto, SplitType } from './dto/split-balance.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Create Expense ----------------
  async create(groupId: string, userId: string, dto: CreateExpenseDto) {
    // Verify user is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Verify paidBy user is a member of the group
    const paidByMembership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId: dto.paidById, groupId },
      },
    });

    if (!paidByMembership || paidByMembership.leftAt !== null) {
      throw new BadRequestException(
        'The person who paid must be a member of the group',
      );
    }

    const expense = await this.prisma.expense.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        paidById: dto.paidById,
        groupId,
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    // Convert Decimal to number for frontend
    return {
      ...expense,
      amount: Number(expense.amount),
    };
  }

  // ---------------- Get All Expenses for Group ----------------
  async findAllForGroup(groupId: string, userId: string) {
    // Verify user is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    const expenses = await this.prisma.expense.findMany({
      where: { groupId },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert Decimal to number for frontend
    return expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    }));
  }

  // ---------------- Get Expense by ID ----------------
  async findOne(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Verify user is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId: expense.groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Convert Decimal to number for frontend
    return {
      ...expense,
      amount: Number(expense.amount),
    };
  }

  // ---------------- Update Expense ----------------
  async update(
    expenseId: string,
    groupId: string,
    userId: string,
    dto: UpdateExpenseDto,
  ) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.groupId !== groupId) {
      throw new BadRequestException('Expense does not belong to this group');
    }

    // Verify user is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Only admin or the person who paid can edit
    const isAdmin = membership.role === 'ADMIN';
    const isPaidBy = expense.paidById === userId;

    if (!isAdmin && !isPaidBy) {
      throw new ForbiddenException(
        'You can only edit expenses you paid or if you are an admin',
      );
    }

    // If paidById is being updated, verify the new user is a member
    if (dto.paidById && dto.paidById !== expense.paidById) {
      const paidByMembership = await this.prisma.groupMember.findUnique({
        where: {
          userId_groupId: { userId: dto.paidById, groupId },
        },
      });

      if (!paidByMembership || paidByMembership.leftAt !== null) {
        throw new BadRequestException(
          'The person who paid must be a member of the group',
        );
      }
    }

    const updated = await this.prisma.expense.update({
      where: { id: expenseId },
      data: {
        ...(dto.description && { description: dto.description }),
        ...(dto.amount && { amount: dto.amount }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.paidById && { paidById: dto.paidById }),
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
    });

    // Convert Decimal to number for frontend
    return {
      ...updated,
      amount: Number(updated.amount),
    };
  }

  // ---------------- Delete Expense ----------------
  async remove(expenseId: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId,
                leftAt: null,
                role: 'ADMIN',
              },
            },
          },
        },
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Only admin or the person who paid can delete
    const isAdmin = expense.group.members.length > 0;
    const isPaidBy = expense.paidById === userId;

    if (!isAdmin && !isPaidBy) {
      throw new ForbiddenException(
        'You can only delete expenses you paid or if you are an admin',
      );
    }

    return this.prisma.expense.delete({
      where: { id: expenseId },
    });
  }

  // ---------------- Get Group Balance Summary ----------------
  async getGroupBalance(groupId: string, userId: string) {
    // Verify user is a member of the group
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Get group to get currency
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      select: { currency: true },
    });

    // Get all expenses for the group
    const expenses = await this.prisma.expense.findMany({
      where: { groupId },
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

    // Calculate total balance (sum all expenses regardless of currency)
    const totalBalance = expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    // Group expenses by paidBy user and currency (separate entries for different currencies)
    const paidByMap = new Map<
      string,
      { user: any; total: number; currency: string }
    >();

    expenses.forEach((expense) => {
      // Use combined key of userId and currency to handle multiple currencies per user
      const key = `${expense.paidById}_${expense.currency}`;
      const existing = paidByMap.get(key);

      if (existing) {
        existing.total += Number(expense.amount);
      } else {
        paidByMap.set(key, {
          user: expense.paidBy,
          total: Number(expense.amount),
          currency: expense.currency,
        });
      }
    });

    const paidBy = Array.from(paidByMap.values());

    return {
      totalBalance,
      paidBy,
      currency: group?.currency || 'USD',
    };
  }

  // ---------------- Split Balance ----------------
  async splitBalance(groupId: string, userId: string, dto: SplitBalanceDto) {
    // Verify user is admin
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    if (membership.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can split the balance');
    }

    // Get all expenses for the group
    const expenses = await this.prisma.expense.findMany({
      where: { groupId },
    });

    // Calculate total balance
    const totalBalance = expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    if (totalBalance === 0) {
      throw new BadRequestException('No balance to split');
    }

    // Get all active members
    const members = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        leftAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Calculate what each member has already paid
    const paidByMember = new Map<string, number>();
    expenses.forEach((expense) => {
      const paid = paidByMember.get(expense.paidById) || 0;
      paidByMember.set(expense.paidById, paid + Number(expense.amount));
    });

    let splits: Array<{ userId: string; amount: number }> = [];

    if (dto.splitType === SplitType.EQUAL) {
      // Equal split: divide total by number of members
      const perPerson = totalBalance / members.length;

      splits = members.map((member) => {
        const paid = paidByMember.get(member.userId) || 0;
        // Amount they should pay (positive) or are owed (negative)
        const amount = perPerson - paid;
        return {
          userId: member.userId,
          amount,
        };
      });
    } else {
      // Unequal split: use provided splits
      if (!dto.memberSplits || dto.memberSplits.length === 0) {
        throw new BadRequestException(
          'Member splits are required for unequal splitting',
        );
      }

      // Validate all members are included
      const providedUserIds = new Set(dto.memberSplits.map((s) => s.userId));
      const memberUserIds = new Set(members.map((m) => m.userId));

      if (providedUserIds.size !== memberUserIds.size) {
        throw new BadRequestException(
          'All members must be included in the split',
        );
      }

      for (const userId of providedUserIds) {
        if (!memberUserIds.has(userId)) {
          throw new BadRequestException(
            `User ${userId} is not a member of this group`,
          );
        }
      }

      // Calculate total of provided splits
      const splitTotal = dto.memberSplits.reduce((sum, split) => {
        return sum + parseFloat(split.amount);
      }, 0);

      // Validate split total matches total balance
      const tolerance = 0.01; // Allow small rounding differences
      if (Math.abs(splitTotal - totalBalance) > tolerance) {
        throw new BadRequestException(
          `Split total (${splitTotal.toFixed(2)}) does not match total balance (${totalBalance.toFixed(2)})`,
        );
      }

      // Calculate final amounts (what they should pay minus what they already paid)
      splits = dto.memberSplits.map((split) => {
        const paid = paidByMember.get(split.userId) || 0;
        const splitAmount = parseFloat(split.amount);
        const amount = splitAmount - paid;
        return {
          userId: split.userId,
          amount,
        };
      });
    }

    // Get group currency (use first expense currency or default)
    const currency = expenses[0]?.currency || 'USD';

    // Delete existing splits and create new ones
    await this.prisma.balanceSplit.deleteMany({
      where: { groupId },
    });

    // Create new splits
    await this.prisma.balanceSplit.createMany({
      data: splits.map((split) => ({
        groupId,
        userId: split.userId,
        amount: split.amount,
        currency,
      })),
    });

    return {
      message: 'Balance split successfully',
      splits: splits.map((split) => ({
        userId: split.userId,
        amount: split.amount,
        currency,
      })),
    };
  }

  // ---------------- Get Member Balances ----------------
  async getMemberBalances(groupId: string, userId: string) {
    // Verify user is a member
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Get all active members
    const members = await this.prisma.groupMember.findMany({
      where: {
        groupId,
        leftAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get balance splits
    const splits = await this.prisma.balanceSplit.findMany({
      where: { groupId },
    });

    const splitMap = new Map<string, number>();
    splits.forEach((split) => {
      splitMap.set(split.userId, Number(split.amount));
    });

    // Return member balances
    return members.map((member) => ({
      userId: member.userId,
      user: member.user,
      role: member.role,
      balance: splitMap.get(member.userId) || 0,
    }));
  }

  // ---------------- Get Who Owes Whom ----------------
  async getWhoOwesWhom(groupId: string, userId: string) {
    // Verify user is a member
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId },
      },
    });

    if (!membership || membership.leftAt !== null) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Get member balances
    const balances = await this.getMemberBalances(groupId, userId);

    // Separate into debtors (positive balance - owe money) and creditors (negative balance - owed money)
    const debtors = balances.filter((b) => b.balance > 0);
    const creditors = balances.filter((b) => b.balance < 0);

    // Calculate settlements
    const settlements: Array<{
      from: { id: string; name: string; email: string };
      to: { id: string; name: string; email: string };
      amount: number;
    }> = [];

    // Simple greedy algorithm to match debtors with creditors
    let debtorIndex = 0;
    let creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];

      const debtorAmount = debtor.balance;
      const creditorAmount = Math.abs(creditor.balance);

      const settlementAmount = Math.min(debtorAmount, creditorAmount);

      settlements.push({
        from: {
          id: debtor.user.id,
          name: debtor.user.name || 'Unknown',
          email: debtor.user.email,
        },
        to: {
          id: creditor.user.id,
          name: creditor.user.name || 'Unknown',
          email: creditor.user.email,
        },
        amount: settlementAmount,
      });

      // Update balances
      debtor.balance -= settlementAmount;
      creditor.balance += settlementAmount;

      // Move to next if balance is zero
      if (debtor.balance <= 0.01) {
        debtorIndex++;
      }
      if (Math.abs(creditor.balance) <= 0.01) {
        creditorIndex++;
      }
    }

    return settlements;
  }

  // ---------------- Get Expense Analytics ----------------
  async getExpenseAnalytics(
    userId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: 1 week
    const end = endDate ? new Date(endDate) : new Date();

    // Get all groups user is part of
    const memberships = await this.prisma.groupMember.findMany({
      where: {
        userId,
        leftAt: null,
      },
      include: {
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const groupIds = memberships.map((m) => m.groupId);

    // Get all expenses in date range
    const expenses = await this.prisma.expense.findMany({
      where: {
        groupId: { in: groupIds },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        paidBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date for line chart
    const dailyData = new Map<string, number>();
    expenses.forEach((expense) => {
      const date = expense.createdAt.toISOString().split('T')[0];
      const current = dailyData.get(date) || 0;
      dailyData.set(date, current + Number(expense.amount));
    });

    // Group by category/group for pie chart
    const groupData = new Map<string, number>();
    expenses.forEach((expense) => {
      const groupName = expense.group.name;
      const current = groupData.get(groupName) || 0;
      groupData.set(groupName, current + Number(expense.amount));
    });

    // Monthly comparison
    const monthlyData = new Map<string, number>();
    expenses.forEach((expense) => {
      const month = expense.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const current = monthlyData.get(month) || 0;
      monthlyData.set(month, current + Number(expense.amount));
    });

    // Calculate payments done and due
    let paymentsDone = 0;
    let paymentsDue = 0;

    for (const membership of memberships) {
      try {
        const balances = await this.getMemberBalances(
          membership.groupId,
          userId,
        );
        const userBalance = balances.find((b) => b.userId === userId);
        if (userBalance) {
          if (userBalance.balance < 0) {
            paymentsDone += Math.abs(userBalance.balance);
          } else if (userBalance.balance > 0) {
            paymentsDue += userBalance.balance;
          }
        }
      } catch (err) {
        // Skip if balance calculation fails (e.g., no splits yet)
        console.error(
          `Failed to get balances for group ${membership.groupId}:`,
          err,
        );
      }
    }

    return {
      dailyExpenses: Array.from(dailyData.entries()).map(([date, amount]) => ({
        date,
        amount: Number(amount),
      })),
      groupExpenses: Array.from(groupData.entries()).map(([group, amount]) => ({
        group,
        amount: Number(amount),
      })),
      monthlyExpenses: Array.from(monthlyData.entries()).map(([month, amount]) => ({
          month,
          amount: Number(amount),
      })),
      paymentsDone,
      paymentsDue,
      totalExpenses: expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    };
  }
}
