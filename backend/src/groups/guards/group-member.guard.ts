import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { id: string }; // From JWT auth
  groupMembership?: any; // You can type this better if needed
  group?: any; // Optional, same here
}

@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;
    // Prioritize 'groupId' over 'id' to handle expenses routes where 'id' is the expense ID
    const groupId = request.params.groupId || request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!groupId) {
      throw new NotFoundException('Group ID not provided');
    }

    // Check if group exists and is not deleted
    const group = await this.prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if user is an active member
    const membership = await this.prisma.groupMember.findFirst({
      where: {
        userId,
        groupId,
        leftAt: null, // Active membership only
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }

    // Attach membership info to request for later use
    request.groupMembership = membership;
    request.group = group;

    return true;
  }
}
