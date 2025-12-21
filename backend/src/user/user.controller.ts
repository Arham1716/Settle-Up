import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // For testing only — fetch user by email
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return await this.userService.getUserByEmail(email);
  }
}
