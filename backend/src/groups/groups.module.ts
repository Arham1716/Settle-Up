import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [PrismaModule, MailModule, ExpensesModule, ActivityModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
