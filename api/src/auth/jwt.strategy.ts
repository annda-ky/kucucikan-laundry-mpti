import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common'; // Added UnauthorizedException
import { PrismaService } from '../prisma.service'; // Added PrismaService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    // Injected PrismaService
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'RAHASIA_NEGARA',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User inactive or deleted');
    }

    // Single Session Enforcement:
    // If the token version in payload doesn't match the DB version,
    // it means a new login has occurred elsewhere.
    if (
      payload.tokenVersion !== undefined &&
      user.tokenVersion !== payload.tokenVersion
    ) {
      throw new UnauthorizedException(
        'Session expired. Active on another device.',
      );
    }

    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
}
