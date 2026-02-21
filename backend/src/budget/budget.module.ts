import { Module, forwardRef } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { BudgetController } from './budget.controller';
import { AlertService } from './alert.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { DeviceTokenModule } from '../device-token/device-token.module';

@Module({
  imports: [PrismaModule, FirebaseModule, DeviceTokenModule],
  controllers: [BudgetController],
  providers: [BudgetService, AlertService],
  exports: [BudgetService, AlertService],
})
export class BudgetModule {}
