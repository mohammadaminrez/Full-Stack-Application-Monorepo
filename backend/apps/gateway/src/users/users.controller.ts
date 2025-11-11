import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto } from '@app/common/dto/create-user.dto';
import { UpdateUserDto } from '@app/common/dto/update-user.dto';
import { UserResponseDto } from '@app/common/dto/user-response.dto';
import { MESSAGE_PATTERNS } from '@app/common/interfaces/message-patterns';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Users Controller - HTTP Layer for User Management
 * Handles CRUD operations for users (authenticated users managing their added users)
 * All endpoints require authentication
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  /**
   * Get current user's added users
   * GET /api/users
   */
  @Get()
  @ApiOperation({ summary: 'Get all users added by current user' })
  @ApiResponse({
    status: 200,
    description: 'List of users created by current user',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyUsers(@Request() req: any): Promise<UserResponseDto[]> {
    const creatorId = req.user.sub; // Extract user ID from JWT

    return firstValueFrom(
      this.authClient.send<UserResponseDto[]>(MESSAGE_PATTERNS.USER_FIND_BY_CREATOR, {
        creatorId,
      }),
    );
  }

  /**
   * Add a new user
   * POST /api/users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new user (created by current user)' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    const creatorId = req.user.sub; // Extract user ID from JWT

    return firstValueFrom(
      this.authClient.send<UserResponseDto>(MESSAGE_PATTERNS.USER_CREATE, {
        createUserDto,
        creatorId,
      }),
    );
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto | null> {
    return firstValueFrom(
      this.authClient.send<UserResponseDto | null>(MESSAGE_PATTERNS.USER_FIND_BY_ID, { userId }),
    );
  }

  /**
   * Update a user
   * PUT /api/users/:id
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a user (only users you created)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or no permission' })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ): Promise<UserResponseDto> {
    const creatorId = req.user.sub; // Extract user ID from JWT

    return firstValueFrom(
      this.authClient.send<UserResponseDto>(MESSAGE_PATTERNS.USER_UPDATE, {
        userId,
        updateUserDto,
        creatorId,
      }),
    );
  }

  /**
   * Delete a user
   * DELETE /api/users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user (only users you created)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 204,
    description: 'User successfully deleted',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or no permission' })
  async deleteUser(@Param('id') userId: string, @Request() req: any): Promise<void> {
    const creatorId = req.user.sub; // Extract user ID from JWT

    await firstValueFrom(
      this.authClient.send<{ success: boolean }>(MESSAGE_PATTERNS.USER_DELETE, {
        userId,
        creatorId,
      }),
    );
  }
}
