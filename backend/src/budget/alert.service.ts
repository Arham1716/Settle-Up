import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BudgetAlertType } from '@prisma/client';
import { FirebaseService } from '../firebase/firebase.service';
import { DeviceTokenService } from '../device-token/device-token.service';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly APPROACHING_THRESHOLD = 80; // 80%
  private readonly EXCEEDED_THRESHOLD = 100; // 100%

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  // ---------------- Check Budget Threshold and Create Alerts ----------------
  async checkBudgetThreshold(
    userId: string,
    budgetId: string,
    categoryId: string | null,
    spent: number,
    allocated: number,
    percentage: number,
  ) {
    // Check if we've already sent an alert for this threshold
    const recentAlert = await this.prisma.budgetAlert.findFirst({
      where: {
        userId,
        budgetId,
        categoryId: categoryId || null,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let alertType: BudgetAlertType | null = null;
    let message = '';

    // Check exceeded threshold first (more critical)
    if (percentage >= this.EXCEEDED_THRESHOLD) {
      // Only alert if we haven't sent an exceeded alert recently
      if (
        !recentAlert ||
        recentAlert.type !== BudgetAlertType.EXCEEDED_BUDGET
      ) {
        alertType = BudgetAlertType.EXCEEDED_BUDGET;
        if (categoryId) {
          const category = await this.prisma.budgetCategory.findUnique({
            where: { id: categoryId },
          });
          message = `Budget exceeded for ${category?.name || 'category'}. Spent ${spent.toFixed(2)} out of ${allocated.toFixed(2)} (${percentage.toFixed(1)}%)`;
        } else {
          message = `Budget exceeded! Spent ${spent.toFixed(2)} out of ${allocated.toFixed(2)} (${percentage.toFixed(1)}%)`;
        }
      }
    }
    // Check approaching threshold
    else if (percentage >= this.APPROACHING_THRESHOLD) {
      // Only alert if we haven't sent an approaching alert recently
      if (
        !recentAlert ||
        recentAlert.type !== BudgetAlertType.APPROACHING_LIMIT
      ) {
        alertType = BudgetAlertType.APPROACHING_LIMIT;
        if (categoryId) {
          const category = await this.prisma.budgetCategory.findUnique({
            where: { id: categoryId },
          });
          message = `Approaching budget limit for ${category?.name || 'category'}. Spent ${spent.toFixed(2)} out of ${allocated.toFixed(2)} (${percentage.toFixed(1)}%)`;
        } else {
          message = `Approaching budget limit! Spent ${spent.toFixed(2)} out of ${allocated.toFixed(2)} (${percentage.toFixed(1)}%)`;
        }
      }
    }

    if (alertType && message) {
      await this.createAlert(userId, budgetId, categoryId, alertType, message);
    }
  }

  // ---------------- Create Alert ----------------
  private async createAlert(
    userId: string,
    budgetId: string,
    categoryId: string | null,
    type: BudgetAlertType,
    message: string,
  ) {
    // Create alert in database
    const alert = await this.prisma.budgetAlert.create({
      data: {
        userId,
        budgetId,
        categoryId,
        type,
        message,
      },
    });

    // Send push notification
    try {
      const tokens = await this.deviceTokenService.getTokensForUsers([userId]);
      if (tokens.length > 0) {
        await this.firebaseService.sendPushNotification(
          tokens,
          'Budget Alert',
          message,
          {
            type: 'BUDGET_ALERT',
            budgetId,
            categoryId: categoryId || '',
            alertType: type,
            url: '/dashboard/budget',
          },
        );
      }
    } catch (error) {
      this.logger.error('Failed to send budget alert notification', error);
      // Don't throw - alert is still created in DB
    }

    this.logger.log(
      `Budget alert created: userId=${userId}, budgetId=${budgetId}, type=${type}`,
    );

    return alert;
  }

  // ---------------- Get Alerts for User ----------------
  async getUserAlerts(userId: string, limit: number = 20) {
    const alerts = await this.prisma.budgetAlert.findMany({
      where: { userId },
      include: {
        budget: {
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return alerts.map((alert) => ({
      ...alert,
      budget: {
        ...alert.budget,
        totalAmount: Number(alert.budget.totalAmount),
      },
    }));
  }

  // ---------------- Mark Alert as Read (optional - for future use) ----------------
  async markAlertRead(alertId: string, userId: string) {
    const alert = await this.prisma.budgetAlert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!alert) {
      return null;
    }

    // For now, we'll just return the alert
    // In the future, you could add a `readAt` field to track read status
    return alert;
  }
}
