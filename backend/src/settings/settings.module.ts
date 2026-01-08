import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [SettingsController],
  providers: [SettingsService, ScheduledTasksService],
  exports: [SettingsService],
})
export class SettingsModule {}

