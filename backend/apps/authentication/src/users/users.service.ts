import { Injectable, Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UsersRepository } from './users.repository';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import { UserResponseDto } from '@app/common/dto/user-response.dto';
import { User } from './schemas/user.schema';

/**
 * Users Service - Business logic layer
 * Handles user-related business operations
 * Sits between controller and repository (MVC pattern)
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Register a new user
   * Logs the operation and transforms entity to DTO
   */
  async register(registerDto: RegisterUserDto): Promise<UserResponseDto> {
    this.logger.log('Registering new user', {
      context: 'UsersService',
      email: registerDto.email,
    });

    const user = await this.usersRepository.create(registerDto);

    this.logger.log('User registered successfully', {
      context: 'UsersService',
      userId: user.id,
    });

    return this.transformToDto(user);
  }

  /**
   * Get all users
   * Returns sanitized user data (no passwords)
   */
  async findAll(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all users', { context: 'UsersService' });

    const users = await this.usersRepository.findAll();
    return users.map((user) => this.transformToDto(user));
  }

  /**
   * Transform database entity to response DTO
   * Removes sensitive fields like password
   */
  private transformToDto(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  }
}
