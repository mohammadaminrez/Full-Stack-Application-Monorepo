import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import { CreateUserDto } from '@app/common/dto/create-user.dto';
import { UpdateUserDto } from '@app/common/dto/update-user.dto';
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
   * Handle user registration via TCP (self-registration)
   * Gateway sends registration data, we process and return user
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_REGISTER)
  async register(@Payload() registerDto: RegisterUserDto): Promise<UserResponseDto> {
    return this.usersService.register(registerDto);
  }

  /**
   * Handle create user via TCP (authenticated user adds a new user)
   * Gateway sends user data and creator ID
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_CREATE)
  async create(
    @Payload() payload: { createUserDto: CreateUserDto; creatorId: string },
  ): Promise<UserResponseDto> {
    return this.usersService.createUser(payload.createUserDto, payload.creatorId);
  }

  /**
   * Handle get all users via TCP (admin function)
   * Gateway requests user list, we return from database
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_FIND_ALL)
  async findAll(): Promise<UserResponseDto[]> {
    return this.usersService.findAll();
  }

  /**
   * Handle get users by creator via TCP
   * Gateway sends creator ID, we return users created by that user
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_FIND_BY_CREATOR)
  async findByCreator(@Payload() payload: { creatorId: string }): Promise<UserResponseDto[]> {
    return this.usersService.findByCreator(payload.creatorId);
  }

  /**
   * Handle get user by ID via TCP
   * Gateway sends user ID, we return user data
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_FIND_BY_ID)
  async findById(@Payload() payload: { userId: string }): Promise<UserResponseDto | null> {
    return this.usersService.findById(payload.userId);
  }

  /**
   * Handle update user via TCP
   * Gateway sends user ID, update data, and creator ID
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_UPDATE)
  async update(
    @Payload()
    payload: { userId: string; updateUserDto: UpdateUserDto; creatorId: string },
  ): Promise<UserResponseDto> {
    return this.usersService.updateUser(payload.userId, payload.updateUserDto, payload.creatorId);
  }

  /**
   * Handle delete user via TCP
   * Gateway sends user ID and creator ID
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_DELETE)
  async delete(
    @Payload() payload: { userId: string; creatorId: string },
  ): Promise<{ success: boolean }> {
    await this.usersService.deleteUser(payload.userId, payload.creatorId);
    return { success: true };
  }

  /**
   * Handle user validation via TCP (for login)
   * Gateway sends credentials, we validate and return user or null
   */
  @MessagePattern(MESSAGE_PATTERNS.USER_VALIDATE)
  async validateUser(@Payload() payload: {
    email: string;
    password: string;
  }): Promise<UserResponseDto | null> {
    return this.usersService.validateUser(payload.email, payload.password);
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
