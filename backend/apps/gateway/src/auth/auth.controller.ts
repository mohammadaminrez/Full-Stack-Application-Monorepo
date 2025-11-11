import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import { LoginUserDto } from '@app/common/dto/login-user.dto';
import { UserResponseDto } from '@app/common/dto/user-response.dto';
import { AuthResponseDto } from '@app/common/dto/auth-response.dto';
import { MESSAGE_PATTERNS } from '@app/common/interfaces/message-patterns';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth Controller - HTTP Gateway Layer
 * Handles authentication (register/login) only
 * User management has moved to UsersController
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly authService: AuthService,
  ) {}

  /**
   * Register new user account
   * POST /api/auth/register
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
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
   * User login
   * POST /api/auth/login
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginUserDto): Promise<AuthResponseDto> {
    // Validate credentials via auth microservice
    const user = await firstValueFrom(
      this.authClient.send<UserResponseDto | null>(
        MESSAGE_PATTERNS.USER_VALIDATE,
        loginDto,
      ),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const accessToken = await this.authService.generateToken(user);

    return new AuthResponseDto(user, accessToken);
  }

  /**
   * Get all users (Assessment requirement: GET /auth/users)
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
  async getAllUsers(): Promise<UserResponseDto[]> {
    return firstValueFrom(
      this.authClient.send<UserResponseDto[]>(MESSAGE_PATTERNS.USER_FIND_ALL, {}),
    );
  }
}
