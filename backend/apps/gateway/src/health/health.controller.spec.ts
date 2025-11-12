import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { of, throwError, TimeoutError } from 'rxjs';
import { MESSAGE_PATTERNS } from '@app/common/interfaces/message-patterns';

describe('HealthController', () => {
  let controller: HealthController;

  const mockAuthClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return basic health status', () => {
      const result = controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('service', 'gateway');
      expect(result).toHaveProperty('timestamp');
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should return timestamp in ISO format', () => {
      const result = controller.check();
      const timestamp = new Date(result.timestamp);

      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });

  describe('ready', () => {
    it('should return ready status when auth service is up', async () => {
      const mockAuthHealth = { status: 'ok' };
      mockAuthClient.send.mockReturnValue(of(mockAuthHealth));

      const result = await controller.ready();

      expect(result).toEqual({
        status: 'ok',
        services: {
          gateway: 'up',
          authentication: 'ok',
        },
        timestamp: expect.any(String),
      });

      expect(mockAuthClient.send).toHaveBeenCalledWith(MESSAGE_PATTERNS.HEALTH_CHECK, {});
    });

    it('should return degraded status when auth service is down', async () => {
      mockAuthClient.send.mockReturnValue(
        throwError(() => new Error('Connection refused')),
      );

      const result = await controller.ready();

      expect(result).toEqual({
        status: 'degraded',
        services: {
          gateway: 'up',
          authentication: 'down',
        },
        timestamp: expect.any(String),
      });
    });

    it('should return degraded status on timeout', async () => {
      mockAuthClient.send.mockReturnValue(throwError(() => new TimeoutError()));

      const result = await controller.ready();

      expect(result.status).toBe('degraded');
      expect(result.services.authentication).toBe('down');
    });

    it('should include timestamp in ISO format', async () => {
      mockAuthClient.send.mockReturnValue(of({ status: 'ok' }));

      const result = await controller.ready();
      const timestamp = new Date(result.timestamp);

      expect(timestamp.toISOString()).toBe(result.timestamp);
    });
  });
});
