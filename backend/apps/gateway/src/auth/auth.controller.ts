import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import { UserResponseDto } from '@app/common/dto/user-response.dto';
import { AuthResponseDto } from '@app/common/dto/auth-response.dto';
import { MESSAGE_PATTERNS } from '@app/common/interfaces/message-patterns';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth Controller - HTTP Gateway Layer
 * Handles all HTTP requests and forwards to authentication microservice via TCP
 * This is the ONLY place with HTTP logic (Controller pattern)
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly authService: AuthService,
  ) {}

  /**
   * Register new user
   * POST /api/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterUserDto): Promise<AuthResponseDto> {
    // Send registration request to auth microservice via TCP
    const user = await firstValueFrom(
      this.authClient.send<UserResponseDto>(MESSAGE_PATTERNS.USER_REGISTER, registerDto),
    );

    // Generate JWT token for the new user
    const accessToken = await this.authService.generateToken(user);

    return new AuthResponseDto(user, accessToken);
  }

  /**
   * Get all users
   * GET /api/auth/users
   */
  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all registered users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: [UserResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUsers(): Promise<UserResponseDto[]> {
    // Request user list from auth microservice via TCP
    return firstValueFrom(
      this.authClient.send<UserResponseDto[]>(MESSAGE_PATTERNS.USER_FIND_ALL, {}),
    );
  }
}
