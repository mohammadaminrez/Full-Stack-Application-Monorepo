import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserResponseDto } from '@app/common/dto/user-response.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  const mockUser: UserResponseDto = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a JWT token with user payload', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.generateToken(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toBe(mockToken);
    });

    it('should generate different tokens for different users', async () => {
      const user1: UserResponseDto = {
        ...mockUser,
        id: 'user1',
        email: 'user1@example.com',
      };
      const user2: UserResponseDto = {
        ...mockUser,
        id: 'user2',
        email: 'user2@example.com',
      };

      mockJwtService.sign.mockReturnValueOnce('token1').mockReturnValueOnce('token2');

      const token1 = await service.generateToken(user1);
      const token2 = await service.generateToken(user2);

      expect(token1).not.toBe(token2);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('should include correct payload structure', async () => {
      mockJwtService.sign.mockReturnValue('mock-token');

      await service.generateToken(mockUser);

      const callArgs = mockJwtService.sign.mock.calls[0][0];
      expect(callArgs).toHaveProperty('sub', mockUser.id);
      expect(callArgs).toHaveProperty('email', mockUser.email);
      expect(callArgs).not.toHaveProperty('password');
      expect(callArgs).not.toHaveProperty('name');
    });

    it('should handle user with minimal required fields', async () => {
      const minimalUser: UserResponseDto = {
        id: '123',
        email: 'minimal@example.com',
        name: 'Min',
        createdAt: new Date(),
      };

      mockJwtService.sign.mockReturnValue('token');

      const result = await service.generateToken(minimalUser);

      expect(result).toBe('token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: minimalUser.id,
        email: minimalUser.email,
      });
    });
  });

  describe('verifyToken', () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';

    it('should verify and decode a valid token', async () => {
      const mockPayload = {
        sub: mockUser.id,
        email: mockUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.verifyToken(validToken);

      expect(jwtService.verify).toHaveBeenCalledWith(validToken);
      expect(result).toEqual(mockPayload);
      expect(result.sub).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.verifyToken(validToken)).rejects.toThrow();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      await expect(service.verifyToken('invalid.token.here')).rejects.toThrow();
    });

    it('should throw UnauthorizedException for malformed token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      await expect(service.verifyToken('not-a-jwt')).rejects.toThrow();
    });

    it('should verify token with correct signature', async () => {
      const mockPayload = {
        sub: '123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234654290,
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.verifyToken(validToken);

      expect(result).toHaveProperty('sub');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('iat');
      expect(result).toHaveProperty('exp');
    });
  });

  describe('token lifecycle', () => {
    it('should generate and verify token successfully', async () => {
      const generatedToken = 'generated.jwt.token';
      const payload = {
        sub: mockUser.id,
        email: mockUser.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      mockJwtService.sign.mockReturnValue(generatedToken);
      mockJwtService.verify.mockReturnValue(payload);

      // Generate token
      const token = await service.generateToken(mockUser);
      expect(token).toBe(generatedToken);

      // Verify token
      const verified = await service.verifyToken(token);
      expect(verified.sub).toBe(mockUser.id);
      expect(verified.email).toBe(mockUser.email);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string token in verify', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt must be provided');
      });

      await expect(service.verifyToken('')).rejects.toThrow();
    });

    it('should handle null-like values gracefully', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid token');
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(service.verifyToken(null as any)).rejects.toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(service.verifyToken(undefined as any)).rejects.toThrow();
    });

    it('should handle special characters in email', async () => {
      const specialUser: UserResponseDto = {
        ...mockUser,
        email: 'test+tag@example.co.uk',
      };

      mockJwtService.sign.mockReturnValue('token');

      await service.generateToken(specialUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: specialUser.id,
        email: 'test+tag@example.co.uk',
      });
    });

    it('should handle very long user IDs', async () => {
      const longIdUser: UserResponseDto = {
        ...mockUser,
        id: '507f1f77bcf86cd799439011507f1f77bcf86cd799439011',
      };

      mockJwtService.sign.mockReturnValue('token');

      await service.generateToken(longIdUser);

      const callArgs = mockJwtService.sign.mock.calls[0][0];
      expect(callArgs.sub).toBe(longIdUser.id);
    });
  });
});
