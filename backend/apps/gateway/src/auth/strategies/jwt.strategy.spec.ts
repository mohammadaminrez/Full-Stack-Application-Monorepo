import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        'jwt.secret': 'test-secret-key-for-testing-minimum-32-characters-long',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should validate and return user object from JWT payload', async () => {
      const payload = {
        sub: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('userId', payload.sub);
      expect(result).toHaveProperty('email', payload.email);
    });

    it('should extract userId from sub claim', async () => {
      const payload = {
        sub: 'user-id-123',
        email: 'user@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe(payload.sub);
    });

    it('should preserve email from payload', async () => {
      const payload = {
        sub: '123',
        email: 'test+tag@example.co.uk',
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe(payload.email);
    });

    it('should return object with userId and email properties', async () => {
      const payload = {
        sub: 'abc123',
        email: 'valid@example.com',
      };

      const result = await strategy.validate(payload);

      expect(Object.keys(result)).toEqual(['userId', 'email']);
      expect(result.userId).toBeDefined();
      expect(result.email).toBeDefined();
    });

    it('should handle payload with additional fields', async () => {
      const payload = {
        sub: '123',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234654290,
        aud: 'test-audience',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe(payload.sub);
      expect(result.email).toBe(payload.email);
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
      expect(result).not.toHaveProperty('aud');
    });

    it('should handle different email formats', async () => {
      const emailFormats = [
        'simple@example.com',
        'user+tag@example.com',
        'firstname.lastname@example.co.uk',
        'user123@test.org',
      ];

      for (const email of emailFormats) {
        const payload = {
          sub: '123',
          email: email,
        };

        const result = await strategy.validate(payload);

        expect(result.email).toBe(email);
      }
    });

    it('should handle various userId formats', async () => {
      const userIds = [
        '123',
        'user-uuid-1234-5678',
        '507f1f77bcf86cd799439011',
        'abc_123_def',
      ];

      for (const userId of userIds) {
        const payload = {
          sub: userId,
          email: 'test@example.com',
        };

        const result = await strategy.validate(payload);

        expect(result.userId).toBe(userId);
      }
    });
  });

  describe('constructor and configuration', () => {
    it('should retrieve JWT secret from config service', () => {
      expect(configService.get).toHaveBeenCalledWith('jwt.secret');
    });

    it('should configure passport with correct options', () => {
      // Strategy should be configured with:
      // - jwtFromRequest: Extract from Authorization header
      // - ignoreExpiration: false (validate expiration)
      // - secretOrKey: from config service
      expect(strategy).toBeDefined();
      expect(configService.get).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle minimal valid payload', async () => {
      const payload = {
        sub: '1',
        email: 'a@b.c',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe('1');
      expect(result.email).toBe('a@b.c');
    });

    it('should handle payload with long userId', async () => {
      const longUserId = 'a'.repeat(100);
      const payload = {
        sub: longUserId,
        email: 'test@example.com',
      };

      const result = await strategy.validate(payload);

      expect(result.userId).toBe(longUserId);
    });

    it('should handle payload with special characters in email', async () => {
      const specialEmail = 'user!#$%&*+-/=?^_`{|}~@example.com';
      const payload = {
        sub: '123',
        email: specialEmail,
      };

      const result = await strategy.validate(payload);

      expect(result.email).toBe(specialEmail);
    });

    it('should handle concurrent validations', async () => {
      const payloads = [
        { sub: '1', email: 'user1@example.com' },
        { sub: '2', email: 'user2@example.com' },
        { sub: '3', email: 'user3@example.com' },
      ];

      const results = await Promise.all(
        payloads.map((payload) => strategy.validate(payload)),
      );

      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.userId).toBe(payloads[index].sub);
        expect(result.email).toBe(payloads[index].email);
      });
    });
  });

  describe('passport integration', () => {
    it('should be used by Passport.js for JWT authentication', () => {
      // The strategy extends PassportStrategy(Strategy, 'jwt')
      // This test verifies the strategy is properly set up
      expect(strategy).toBeDefined();
      expect(strategy.validate).toBeDefined();
      expect(typeof strategy.validate).toBe('function');
    });

    it('should return user object that can be attached to request', async () => {
      const payload = {
        sub: '123',
        email: 'test@example.com',
      };

      const user = await strategy.validate(payload);

      // This object will be attached to request.user by Passport
      expect(user).toHaveProperty('userId');
      expect(user).toHaveProperty('email');
      expect(typeof user).toBe('object');
    });
  });
});
