import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GroupsModule } from './groups/groups.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { InviteModule } from './invite/invite.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DashboardModule } from "./dashboard/dashboard.module";

@Module({
  imports: [
    AuthModule,
    UserModule,
    GroupsModule,
    PrismaModule,
    MailModule,
    InviteModule,
    ExpensesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
