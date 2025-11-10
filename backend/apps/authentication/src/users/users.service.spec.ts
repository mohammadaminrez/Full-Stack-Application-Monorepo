import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('UsersService', () => {
  let service: UsersService;

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByEmail: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
      };

      const mockUser = {
        id: '123',
        ...registerDto,
        createdAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', registerDto.email);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', name: 'User 1', createdAt: new Date() },
        { id: '2', email: 'user2@test.com', name: 'User 2', createdAt: new Date() },
      ];

      mockRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('email');
    });
  });
});
