import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { CreateUserDto } from '@app/common/dto/create-user.dto';
import { UpdateUserDto } from '@app/common/dto/update-user.dto';
import { UserResponseDto } from '@app/common/dto/user-response.dto';
import { MESSAGE_PATTERNS } from '@app/common/interfaces/message-patterns';

describe('UsersController', () => {
  let controller: UsersController;
  let authClient: ClientProxy;

  const mockAuthClient = {
    send: jest.fn(),
  };

  const mockUser: UserResponseDto = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
  };

  const mockRequest = {
    user: { sub: 'creator123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    authClient = module.get<ClientProxy>('AUTH_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyUsers', () => {
    it('should return users created by current user', async () => {
      const users = [mockUser];
      mockAuthClient.send.mockReturnValue(of(users));

      const result = await controller.getMyUsers(mockRequest as any);

      expect(result).toEqual(users);
      expect(mockAuthClient.send).toHaveBeenCalledWith(
        MESSAGE_PATTERNS.USER_FIND_BY_CREATOR,
        { creatorId: 'creator123' },
      );
    });

    it('should return empty array when no users found', async () => {
      mockAuthClient.send.mockReturnValue(of([]));

      const result = await controller.getMyUsers(mockRequest as any);

      expect(result).toEqual([]);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'Password123!',
      };

      mockAuthClient.send.mockReturnValue(of(mockUser));

      const result = await controller.createUser(createUserDto, mockRequest as any);

      expect(result).toEqual(mockUser);
      expect(mockAuthClient.send).toHaveBeenCalledWith(MESSAGE_PATTERNS.USER_CREATE, {
        createUserDto,
        creatorId: 'creator123',
      });
    });

    it('should handle validation errors', async () => {
      const createUserDto: CreateUserDto = {
        email: 'invalid-email',
        name: '',
        password: '123',
      };

      mockAuthClient.send.mockReturnValue(
        throwError(() => new Error('Validation failed')),
      );

      await expect(
        controller.createUser(createUserDto, mockRequest as any),
      ).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      mockAuthClient.send.mockReturnValue(of(mockUser));

      const result = await controller.getUserById('user123');

      expect(result).toEqual(mockUser);
      expect(mockAuthClient.send).toHaveBeenCalledWith(
        MESSAGE_PATTERNS.USER_FIND_BY_ID,
        { userId: 'user123' },
      );
    });

    it('should return null when user not found', async () => {
      mockAuthClient.send.mockReturnValue(of(null));

      const result = await controller.getUserById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockAuthClient.send.mockReturnValue(of(updatedUser));

      const result = await controller.updateUser(
        'user123',
        updateUserDto,
        mockRequest as any,
      );

      expect(result).toEqual(updatedUser);
      expect(mockAuthClient.send).toHaveBeenCalledWith(MESSAGE_PATTERNS.USER_UPDATE, {
        userId: 'user123',
        updateUserDto,
        creatorId: 'creator123',
      });
    });

    it('should handle update errors', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'duplicate@example.com',
      };

      mockAuthClient.send.mockReturnValue(
        throwError(() => new Error('Email already exists')),
      );

      await expect(
        controller.updateUser('user123', updateUserDto, mockRequest as any),
      ).rejects.toThrow();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockAuthClient.send.mockReturnValue(of({ success: true }));

      await controller.deleteUser('user123', mockRequest as any);

      expect(mockAuthClient.send).toHaveBeenCalledWith(MESSAGE_PATTERNS.USER_DELETE, {
        userId: 'user123',
        creatorId: 'creator123',
      });
    });

    it('should handle deletion errors', async () => {
      mockAuthClient.send.mockReturnValue(
        throwError(() => new Error('User not found')),
      );

      await expect(controller.deleteUser('user123', mockRequest as any)).rejects.toThrow();
    });
  });
});
