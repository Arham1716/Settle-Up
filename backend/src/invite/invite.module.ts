import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityService } from 'src/activity/activity.service';

@Module({
  controllers: [InviteController],
  providers: [InviteService, PrismaService, ActivityService],
})
export class InviteModule {}
