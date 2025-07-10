import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
    });
  }

  async validate(payload: any) {
    try {
      console.log('Validating JWT payload:', payload);

      if (!payload.userId) {
        console.log('No userId in payload');
        throw new UnauthorizedException('Invalid token structure');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, fullName: true },
      });

      if (!user) {
        console.log('No user found for id:', payload.userId);
        throw new UnauthorizedException('User not found');
      }

      console.log('Found user:', user);
      console.log('Token role:', payload.role);
      console.log('Database role:', user.role);

      // Verify that the token role matches the database role
      if (payload.role !== user.role) {
        console.log('Role mismatch between token and database');
        throw new UnauthorizedException('Invalid role in token');
      }

      // Create the user object that will be available in the request
      const userResponse = {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      };

      console.log('Returning user response:', userResponse);
      return userResponse;
    } catch (error) {
      console.error('JWT validation error:', error);
      throw error;
    }
  }
}