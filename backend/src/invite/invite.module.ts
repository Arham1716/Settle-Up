import { Module } from '@nestjs/common';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InviteController],
  providers: [InviteService, PrismaService],
})
export class InviteModule {}
