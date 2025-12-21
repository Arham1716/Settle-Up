import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { GroupRole } from '@prisma/client';
import { GroupMemberGuard } from './group-member.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GroupAdminGuard extends GroupMemberGuard implements CanActivate {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if user is a member
    const isMember = await super.canActivate(context);
    if (!isMember) return false;

    const request = context.switchToHttp().getRequest();
    const membership = request.groupMembership;

    if (membership.role !== GroupRole.ADMIN) {
      throw new ForbiddenException('Only group admins can perform this action');
    }

    return true;
  }
}
