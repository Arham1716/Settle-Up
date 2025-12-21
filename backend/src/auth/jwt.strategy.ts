import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
}

const jwtStrategyOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET as string,
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super(jwtStrategyOptions);
  }

  validate(payload: JwtPayload): { id: string; email: string } {
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
