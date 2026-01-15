import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ActivityType, Prisma } from "@prisma/client";

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async getUserActivity(userId: string) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        actor: {
          select: { id: true, name: true, email: true },
        },
        group: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async logActivity(params: {
    actorId: string;
    userId: string;
    groupId?: string;
    type: ActivityType;
    title: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.activity.create({
      data: params,
    });
  }
}
