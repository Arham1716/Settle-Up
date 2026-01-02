import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

    if (!user) throw new UnauthorizedException('Invalid email or password');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid email or password');

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return token; // return JWT, do not set cookie here
  }

  // GET ME
  async me(userId: string) {
    return this.userService.getUserById(userId); // make sure this method exists
  }
}
