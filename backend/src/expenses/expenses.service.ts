import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

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
      throw new BadRequestException('The person who paid must be a member of the group');
    }

    return this.prisma.expense.create({
      data: {
        description: dto.description,
        amount: dto.amount,
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

    return expenses;
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

    return expense;
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
      throw new ForbiddenException('You can only delete expenses you paid or if you are an admin');
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

    // Calculate total balance
    const totalBalance = expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    // Group expenses by paidBy user
    const paidByMap = new Map<string, { user: any; total: number }>();

    expenses.forEach((expense) => {
      const paidById = expense.paidById;
      const existing = paidByMap.get(paidById);

      if (existing) {
        existing.total += Number(expense.amount);
      } else {
        paidByMap.set(paidById, {
          user: expense.paidBy,
          total: Number(expense.amount),
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
}

