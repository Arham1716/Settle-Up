import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("activity")
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getActivity(@Req() req: any) {
    const userId = req.user.id;
    return this.activityService.getUserActivity(userId);
  }

  @Get("unseen-count")
  async getUnseenCount(@Req() req: any) {
    const userId = req.user.id;
    return this.activityService.getUnseenCount(userId);
  }

  @Post("mark-all-seen")
  async markAllSeen(@Req() req: any) {
    const userId = req.user.id;
    return this.activityService.markAllSeen(userId);
  }
}
