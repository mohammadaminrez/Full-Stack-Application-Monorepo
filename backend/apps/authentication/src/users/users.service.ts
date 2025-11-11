import { Injectable, Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UsersRepository } from './users.repository';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import { CreateUserDto } from '@app/common/dto/create-user.dto';
import { UpdateUserDto } from '@app/common/dto/update-user.dto';
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
   * Register a new user (self-registration)
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
   * Create a new user by an authenticated user
   * The authenticated user becomes the creator
   */
  async createUser(
    createUserDto: CreateUserDto,
    creatorId: string,
  ): Promise<UserResponseDto> {
    this.logger.log('Creating new user', {
      context: 'UsersService',
      email: createUserDto.email,
      creatorId,
    });

    const user = await this.usersRepository.createByUser(createUserDto, creatorId);

    this.logger.log('User created successfully', {
      context: 'UsersService',
      userId: user.id,
      creatorId,
    });

    return this.transformToDto(user);
  }

  /**
   * Get all users (admin function)
   * Returns sanitized user data (no passwords)
   */
  async findAll(): Promise<UserResponseDto[]> {
    this.logger.log('Fetching all users', { context: 'UsersService' });

    const users = await this.usersRepository.findAll();
    return users.map((user) => this.transformToDto(user));
  }

  /**
   * Get users created by a specific user
   * Returns only users that the authenticated user has created
   */
  async findByCreator(creatorId: string): Promise<UserResponseDto[]> {
    this.logger.log('Fetching users by creator', {
      context: 'UsersService',
      creatorId,
    });

    const users = await this.usersRepository.findByCreator(creatorId);
    return users.map((user) => this.transformToDto(user));
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findById(userId);
    return user ? this.transformToDto(user) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findByEmail(email);
    return user ? this.transformToDto(user) : null;
  }

  /**
   * Update a user
   * Only the creator can update their created users
   */
  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    creatorId: string,
  ): Promise<UserResponseDto> {
    this.logger.log('Updating user', {
      context: 'UsersService',
      userId,
      creatorId,
    });

    const user = await this.usersRepository.update(userId, updateUserDto, creatorId);

    this.logger.log('User updated successfully', {
      context: 'UsersService',
      userId: user.id,
    });

    return this.transformToDto(user);
  }

  /**
   * Delete a user
   * Only the creator can delete their created users
   */
  async deleteUser(userId: string, creatorId: string): Promise<void> {
    this.logger.log('Deleting user', {
      context: 'UsersService',
      userId,
      creatorId,
    });

    await this.usersRepository.delete(userId, creatorId);

    this.logger.log('User deleted successfully', {
      context: 'UsersService',
      userId,
    });
  }

  /**
   * Validate user credentials for login
   */
  async validateUser(email: string, password: string): Promise<UserResponseDto | null> {
    this.logger.log('Validating user credentials', {
      context: 'UsersService',
      email,
    });

    const user = await this.usersRepository.validateUser(email, password);
    return user ? this.transformToDto(user) : null;
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
