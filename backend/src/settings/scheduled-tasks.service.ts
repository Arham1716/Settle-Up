// Scheduled tasks service disabled - requires deletedAt field in User model
// To enable: add deletedAt DateTime? to User model in schema.prisma
import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Disabled - requires deletedAt field in User model
  // @Cron(CronExpression.EVERY_DAY_AT_2AM)
  // async hardDeleteOldUsers() {
  //   // Implementation requires deletedAt field
  // }
}

