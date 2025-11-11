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

    it('should return empty array when no users exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should transform users to DTOs', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          createdAt: new Date(),
          _id: 'mongo-id-1'
        },
      ];

      mockRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).not.toHaveProperty('password');
    });

    it('should handle repository errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'Password123!';

    it('should validate user with correct credentials', async () => {
      const mockValidatedUser = {
        id: '123',
        email: email,
        name: 'Test User',
        createdAt: new Date(),
      };

      mockRepository.validateUser.mockResolvedValue(mockValidatedUser);

      const result = await service.validateUser(email, password);

      expect(mockRepository.validateUser).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(mockValidatedUser);
      expect(result).not.toBeNull();
    });

    it('should return null for incorrect password', async () => {
      mockRepository.validateUser.mockResolvedValue(null);

      const result = await service.validateUser(email, 'WrongPassword');

      expect(result).toBeNull();
      expect(mockRepository.validateUser).toHaveBeenCalledWith(
        email,
        'WrongPassword',
      );
    });

    it('should return null for non-existent user', async () => {
      mockRepository.validateUser.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        password,
      );

      expect(result).toBeNull();
    });

    it('should handle validation errors from repository', async () => {
      mockRepository.validateUser.mockRejectedValue(
        new Error('Validation error'),
      );

      await expect(service.validateUser(email, password)).rejects.toThrow(
        'Validation error',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle registration with minimum valid data', async () => {
      const minimalDto = {
        email: 'a@b.co',
        password: 'Pass123!',
        name: 'AB',
      };

      const mockUser = {
        id: '123',
        ...minimalDto,
        createdAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.register(minimalDto);

      expect(result).toHaveProperty('email', minimalDto.email);
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should handle registration with long names', async () => {
      const longNameDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'A'.repeat(100),
      };

      const mockUser = {
        id: '123',
        ...longNameDto,
        createdAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.register(longNameDto);

      expect(result).toHaveProperty('name', longNameDto.name);
    });

    it('should handle special characters in email during validation', async () => {
      const specialEmail = 'test+tag@example.co.uk';

      mockRepository.validateUser.mockResolvedValue({
        id: '123',
        email: specialEmail,
        name: 'Test',
        createdAt: new Date(),
      });

      const result = await service.validateUser(specialEmail, 'Password123!');

      expect(result).not.toBeNull();
      expect(result?.email).toBe(specialEmail);
    });

    it('should log registration attempts', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      };

      mockRepository.create.mockResolvedValue({
        id: '123',
        ...registerDto,
        createdAt: new Date(),
      });

      await service.register(registerDto);

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Registering new user',
        expect.any(Object),
      );
    });

    it('should log validation attempts', async () => {
      mockRepository.validateUser.mockResolvedValue(null);

      await service.validateUser('test@example.com', 'Password123!');

      expect(mockLogger.log).toHaveBeenCalledWith(
        'Validating user credentials',
        expect.any(Object),
      );
    });
  });
});
