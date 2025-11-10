import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let authClient: ClientProxy;

  const mockAuthService = {
    generateToken: jest.fn(),
  };

  const mockAuthClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    authClient = module.get<ClientProxy>('AUTH_SERVICE');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return auth response', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
      };

      const mockUser = {
        id: '123',
        email: registerDto.email,
        name: registerDto.name,
        createdAt: new Date(),
      };

      const mockToken = 'jwt-token-123';

      mockAuthClient.send.mockReturnValue(of(mockUser));
      mockAuthService.generateToken.mockResolvedValue(mockToken);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken', mockToken);
      expect(result.user.email).toBe(registerDto.email);
    });
  });

  describe('getUsers', () => {
    it('should return array of users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', name: 'User 1', createdAt: new Date() },
        { id: '2', email: 'user2@test.com', name: 'User 2', createdAt: new Date() },
      ];

      mockAuthClient.send.mockReturnValue(of(mockUsers));

      const result = await controller.getUsers();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('email');
    });
  });
});
