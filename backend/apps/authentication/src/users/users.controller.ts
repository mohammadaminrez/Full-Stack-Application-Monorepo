import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import { UserResponseDto } from '@app/common/dto/user-response.dto';
import { MESSAGE_PATTERNS } from '@app/common/interfaces/message-patterns';

/**
 * Users Controller - TCP message handler
 * This is NOT an HTTP controller - it handles TCP messages from the gateway
 * Uses @MessagePattern instead of @Get/@Post decorators
 */
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Handle user registration via TCP
   * Gateway sends registration data, we process and return user
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_REGISTER)
  async register(registerDto: RegisterUserDto): Promise<UserResponseDto> {
    return this.usersService.register(registerDto);
  }

  /**
   * Handle get all users via TCP
   * Gateway requests user list, we return from database
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_FIND_ALL)
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  /**
   * Handle health check via TCP
   * Allows gateway to verify this service is running
   */
  @MessagePattern(MESSAGE_PATTERNS.HEALTH_CHECK)
  async healthCheck(): Promise<{ status: string; service: string }> {
    return {
      status: 'ok',
      service: 'authentication',
    };
  }
}
