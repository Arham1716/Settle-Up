import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // adjust if needed

@Controller('invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  /**
   * PUBLIC
   * Verify invite token (email click)
   */
  @Get('verify/:token')
  async verifyInvite(@Param('token') token: string) {
    return this.inviteService.verifyInvite(token);
  }

  /**
   * PROTECTED
   * Accept invite after login/signup
   */
  @UseGuards(JwtAuthGuard)
  @Post('accept')
  async acceptInvite(
    @Body('token') token: string,
    @Body('displayName') displayName: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;

    if (!displayName || displayName.trim().length < 2) {
      throw new BadRequestException('Display name is required');
    }

    const result = await this.inviteService.acceptInvite(
      token,
      userId,
      displayName.trim(),
    );
    return result;
  }
}
