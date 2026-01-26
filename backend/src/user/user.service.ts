import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Get user by email
  async getUserByEmail(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    return this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
  }
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  // Create a new user
  async createUser(data: { email: string; password: string }) {
    return this.prisma.user.create({
      data,
    });
  }

  // Update user after resetting password
  async updateUser(
    userId: string,
    data: Partial<{ password: string }>,
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
