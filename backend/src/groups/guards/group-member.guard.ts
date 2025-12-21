import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const groupId = request.params.id;

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
