import { Module, forwardRef } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { PrismaService } from "../prisma/prisma.service";
import { BudgetModule } from "../budget/budget.module";

@Module({
  imports: [forwardRef(() => BudgetModule)],
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService],
})
export class DashboardModule {}
