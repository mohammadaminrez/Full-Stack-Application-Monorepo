import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Auth Guard
 * Protects routes requiring authentication
 * Usage: @UseGuards(JwtAuthGuard) on controller methods
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Handle request validation
   * Throws clear error message if auth fails
   */
  handleRequest(err: Error | null, user: { userId: string; email: string } | false) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing authentication token');
    }
    return user;
  }
}
