import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type StrategyOptions } from 'passport-jwt';
import type { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
}

// Custom extractor: try cookie first, then Authorization header
const cookieExtractor = (req: Request): string | null => {
  try {
    // Check if cookies exist and are parsed
    if (req && req.cookies && typeof req.cookies === 'object') {
      const token = req.cookies['jwt'] || null;
      if (token) {
        return token;
      }
    }
    // Also try to parse from raw cookie header as fallback
    if (req && req.headers && req.headers.cookie) {
      const cookies = req.headers.cookie
        .split(';')
        .reduce((acc: Record<string, string>, cookie: string) => {
        const [key, value] = cookie.trim().split('=');
          if (key && value) acc[key] = value;
          return acc;
        }, {});
      if (cookies['jwt']) {
        return cookies['jwt'];
      }
    }
    console.log('Cookie extractor - no jwt token found');
    return null;
  } catch (err) {
    console.error('Cookie extractor error:', err);
    return null;
  }
};

const jwtStrategyOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: process.env.JWT_SECRET as string,
  ignoreExpiration: false,
  passReqToCallback: false,
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
