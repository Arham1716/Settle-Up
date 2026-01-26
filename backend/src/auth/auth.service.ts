import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // SIGNUP
  async signup(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.userService.getUserByEmail(normalizedEmail);

    if (existing) {
      throw new BadRequestException('User already exists');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.userService.createUser({
      email: normalizedEmail,
      password: hashed,
    });

    return { message: 'Signup successful', user };
  }

  // LOGIN - returns JWT only, cookie handled in controller
  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userService.getUserByEmail(normalizedEmail);

    if (!user) {
      throw new BadRequestException('Email not registered');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Your account is not fully set up. Please set a password or signup again.'
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new BadRequestException('Incorrect password');

    return this.jwtService.signAsync({ sub: user.id, email: user.email });
  }

  // GET ME
  async me(userId: string) {
    return this.userService.getUserById(userId); // make sure this method exists
  }

  // Forgot password
  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userService.getUserByEmail(normalizedEmail);

    // Prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link was sent' };
    }

    // Generate a JWT token for password reset
    const token = await this.jwtService.signAsync(
      { sub: user.id },
      { expiresIn: '15m' },
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'If the email exists, a reset link was sent' };
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.userService.updateUser(payload.sub, {
      password: hashed,
    });

    return { message: 'Password updated successfully' };
  }
}
