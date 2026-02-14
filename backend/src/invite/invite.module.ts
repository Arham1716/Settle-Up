import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from 'src/activity/activity.service';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [InviteController],
  providers: [InviteService, PrismaService],
})
export class InviteModule {}
