import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { UsersRepository } from './users.repository';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let model: Model<User>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    toObject: jest.fn().mockReturnThis(),
  };

  const mockUserModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
    select: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    model = module.get<Model<User>>(getModelToken(User.name));

    // Reset all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should create a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const savedUser = {
        ...mockUser,
        toObject: () => ({
          _id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          createdAt: mockUser.createdAt,
        }),
      };

      mockUserModel.create = jest.fn().mockResolvedValue(savedUser);

      const result = await repository.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
      expect(result).toHaveProperty('email', createUserDto.email);
      expect(result).toHaveProperty('name', createUserDto.name);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException when email already exists', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const duplicateError = { code: 11000 };
      mockUserModel.create = jest.fn().mockRejectedValue(duplicateError);

      await expect(repository.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(repository.create(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const genericError = new Error('Database connection failed');
      mockUserModel.create = jest.fn().mockRejectedValue(genericError);

      await expect(repository.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(repository.create(createUserDto)).rejects.toThrow(
        'Failed to create user',
      );
    });

    it('should hash password before saving', async () => {
      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const savedUser = {
        ...mockUser,
        toObject: () => ({ ...mockUser }),
      };

      mockUserModel.create = jest.fn().mockResolvedValue(savedUser);

      await repository.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      const users = [
        {
          _id: '1',
          email: 'user1@test.com',
          name: 'User 1',
          createdAt: new Date(),
          toObject: jest.fn().mockReturnValue({
            _id: '1',
            email: 'user1@test.com',
            name: 'User 1',
            createdAt: new Date(),
          }),
        },
        {
          _id: '2',
          email: 'user2@test.com',
          name: 'User 2',
          createdAt: new Date(),
          toObject: jest.fn().mockReturnValue({
            _id: '2',
            email: 'user2@test.com',
            name: 'User 2',
            createdAt: new Date(),
          }),
        },
      ];

      const selectMock = jest.fn().mockResolvedValue(users);
      mockUserModel.find = jest.fn().mockReturnValue({ select: selectMock });

      const result = await repository.findAll();

      expect(mockUserModel.find).toHaveBeenCalled();
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
    });

    it('should return empty array when no users exist', async () => {
      const selectMock = jest.fn().mockResolvedValue([]);
      mockUserModel.find = jest.fn().mockReturnValue({ select: selectMock });

      const result = await repository.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const execMock = jest.fn().mockResolvedValue(mockUser);
      mockUserModel.findOne = jest.fn().mockReturnValue({ exec: execMock });

      const result = await repository.findByEmail('test@example.com');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      mockUserModel.findOne = jest.fn().mockReturnValue({ exec: execMock });

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle case-insensitive email search', async () => {
      const execMock = jest.fn().mockResolvedValue(mockUser);
      mockUserModel.findOne = jest.fn().mockReturnValue({ exec: execMock });

      await repository.findByEmail('TEST@EXAMPLE.COM');

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: 'TEST@EXAMPLE.COM',
      });
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const password = 'Password123!';
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword123',
        toObject: jest.fn().mockReturnValue({
          _id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          createdAt: mockUser.createdAt,
        }),
      };

      const execMock = jest.fn().mockResolvedValue(userWithPassword);
      mockUserModel.findOne = jest.fn().mockReturnValue({ exec: execMock });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await repository.validateUser(mockUser.email, password);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        email: mockUser.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        userWithPassword.password,
      );
      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result?.email).toBe(mockUser.email);
    });

    it('should return null when user does not exist', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      mockUserModel.findOne = jest.fn().mockReturnValue({ exec: execMock });

      const result = await repository.validateUser(
        'nonexistent@example.com',
        'Password123!',
      );

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is incorrect', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword123',
      };

      const execMock = jest.fn().mockResolvedValue(userWithPassword);
      mockUserModel.findOne = jest.fn().mockReturnValue({ exec: execMock });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await repository.validateUser(
        mockUser.email,
        'WrongPassword123!',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'WrongPassword123!',
        userWithPassword.password,
      );
      expect(result).toBeNull();
    });

    it('should handle bcrypt compare errors', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashedPassword123',
      };

      const execMock = jest.fn().mockResolvedValue(userWithPassword);
      mockUserModel.findOne = jest.fn().mockReturnValue({ exec: execMock });
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt error'),
      );

      await expect(
        repository.validateUser(mockUser.email, 'Password123!'),
      ).rejects.toThrow();
    });
  });
});
