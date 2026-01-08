import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController, AnalyticsController } from './expenses.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExpensesController, AnalyticsController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
