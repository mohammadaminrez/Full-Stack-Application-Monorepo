import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import { LoginUserDto } from '@app/common/dto/login-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    register: jest.fn(),
    findAll: jest.fn(),
    validateUser: jest.fn(),
  };

  // Unused variable - keeping for potential future use
  // const mockUser = {
  //   id: '507f1f77bcf86cd799439011',
  //   email: 'test@example.com',
  //   name: 'Test User',
  //   createdAt: new Date('2024-01-01'),
  // };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register (TCP message pattern)', () => {
    it('should handle user registration via TCP', async () => {
      const registerDto: RegisterUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
      };

      const expectedResult = {
        id: '123',
        email: registerDto.email,
        name: registerDto.name,
        createdAt: new Date(),
      };

      mockUsersService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', registerDto.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should propagate errors from service layer', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test',
      };

      mockUsersService.register.mockRejectedValue(new Error('Email already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should handle registration with all valid fields', async () => {
      const registerDto: RegisterUserDto = {
        email: 'complete@example.com',
        password: 'SecurePass123!',
        name: 'Complete User',
      };

      const result = {
        id: 'new-id',
        email: registerDto.email,
        name: registerDto.name,
        createdAt: new Date(),
      };

      mockUsersService.register.mockResolvedValue(result);

      const response = await controller.register(registerDto);

      expect(response.email).toBe(registerDto.email);
      expect(response.name).toBe(registerDto.name);
      expect(response).not.toHaveProperty('password');
    });
  });

  describe('findAll (TCP message pattern)', () => {
    it('should return all users via TCP', async () => {
      const users = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          createdAt: new Date(),
        },
        {
          id: '2',
          email: 'user2@test.com',
          name: 'User 2',
          createdAt: new Date(),
        },
      ];

      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should not include passwords in response', async () => {
      const users = [
        {
          id: '1',
          email: 'user@test.com',
          name: 'User',
          createdAt: new Date(),
        },
      ];

      mockUsersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(result[0]).not.toHaveProperty('password');
    });

    it('should handle service errors', async () => {
      mockUsersService.findAll.mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('validateUser (TCP message pattern)', () => {
    it('should validate user credentials via TCP', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const validatedUser = {
        id: '123',
        email: loginDto.email,
        name: 'Test User',
        createdAt: new Date(),
      };

      mockUsersService.validateUser.mockResolvedValue(validatedUser);

      const result = await controller.validateUser(loginDto);

      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(result).toEqual(validatedUser);
      expect(result).not.toBeNull();
    });

    it('should return null for invalid credentials', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      mockUsersService.validateUser.mockResolvedValue(null);

      const result = await controller.validateUser(loginDto);

      expect(result).toBeNull();
      expect(service.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
    });

    it('should return null for non-existent user', async () => {
      const loginDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      mockUsersService.validateUser.mockResolvedValue(null);

      const result = await controller.validateUser(loginDto);

      expect(result).toBeNull();
    });

    it('should handle validation errors', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      mockUsersService.validateUser.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.validateUser(loginDto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should not return password in validated user', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const validatedUser = {
        id: '123',
        email: loginDto.email,
        name: 'Test',
        createdAt: new Date(),
      };

      mockUsersService.validateUser.mockResolvedValue(validatedUser);

      const result = await controller.validateUser(loginDto);

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('healthCheck (TCP message pattern)', () => {
    it('should respond to health check', async () => {
      const result = await controller.healthCheck();

      expect(result).toEqual({ status: 'ok', service: 'authentication' });
    });

    it('should always return ok status', async () => {
      const result1 = await controller.healthCheck();
      const result2 = await controller.healthCheck();

      expect(result1.status).toBe('ok');
      expect(result2.status).toBe('ok');
    });

    it('should identify the authentication service', async () => {
      const result = await controller.healthCheck();

      expect(result.service).toBe('authentication');
    });
  });

  describe('TCP message pattern integration', () => {
    it('should handle concurrent TCP requests', async () => {
      const registerDto: RegisterUserDto = {
        email: 'concurrent@example.com',
        password: 'Password123!',
        name: 'Concurrent User',
      };

      mockUsersService.register.mockResolvedValue({
        id: '1',
        ...registerDto,
        password: undefined,
        createdAt: new Date(),
      });

      mockUsersService.findAll.mockResolvedValue([]);

      const [registerResult, findAllResult] = await Promise.all([
        controller.register(registerDto),
        controller.findAll(),
      ]);

      expect(registerResult).toBeDefined();
      expect(findAllResult).toBeDefined();
    });

    it('should maintain data consistency across message patterns', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test',
      };

      const user = {
        id: '123',
        email: registerDto.email,
        name: registerDto.name,
        createdAt: new Date(),
      };

      mockUsersService.register.mockResolvedValue(user);
      mockUsersService.findAll.mockResolvedValue([user]);

      await controller.register(registerDto);
      const allUsers = await controller.findAll();

      expect(allUsers).toHaveLength(1);
    });
  });
});
