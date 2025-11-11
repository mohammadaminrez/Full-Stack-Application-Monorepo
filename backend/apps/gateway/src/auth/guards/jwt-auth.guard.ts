import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
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
  handleRequest<TUser = { userId: string; email: string }>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing authentication token');
    }
    return user;
  }
}
