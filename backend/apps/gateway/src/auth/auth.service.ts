import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from '@app/common/dto/user-response.dto';

/**
 * Auth Service - JWT token management
 * Handles token generation and validation
 * Business logic stays minimal in gateway (just token handling)
 */
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate JWT access token for authenticated user
   * Token contains user ID and email for authorization
   */
  async generateToken(user: UserResponseDto): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Verify and decode JWT token
   * Returns payload if valid, throws error if invalid
   */
  async verifyToken(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }
}
