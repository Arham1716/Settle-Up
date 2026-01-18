import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController, AnalyticsController } from './expenses.controller';
import { ActivityModule } from '../activity/activity.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ActivityModule],
  controllers: [ExpensesController, AnalyticsController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
