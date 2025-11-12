import { Test, TestingModule } from '@nestjs/testing';
import { RequestLoggerMiddleware } from './request-logger.middleware';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

describe('RequestLoggerMiddleware', () => {
  let middleware: RequestLoggerMiddleware;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(async () => {
    mockLogger = {
      info: jest.fn(),
      log: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestLoggerMiddleware,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
      ],
    }).compile();

    middleware = module.get<RequestLoggerMiddleware>(RequestLoggerMiddleware);

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/users',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'test-agent',
      },
    };

    const eventHandlers: Record<string, () => void> = {};
    mockResponse = {
      setHeader: jest.fn(),
      on: jest.fn((event: string, handler: () => void) => {
        eventHandlers[event] = handler;
        return mockResponse as Response;
      }),
      emit: jest.fn((event: string) => {
        if (eventHandlers[event]) {
          eventHandlers[event]();
        }
        return true;
      }),
      statusCode: 200,
    };

    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  describe('use', () => {
    it('should generate request ID if not provided', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'X-Request-ID',
        expect.any(String),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          requestId: expect.any(String),
          method: 'GET',
          url: '/api/users',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
        }),
      );
    });

    it('should use existing request ID from header', () => {
      const existingId = 'existing-uuid';
      mockRequest.headers = {
        ...mockRequest.headers,
        'x-request-id': existingId,
      };

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', existingId);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          requestId: existingId,
        }),
      );
    });

    it('should add request ID to request object', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect((mockRequest as any).requestId).toBeDefined();
      expect(typeof (mockRequest as any).requestId).toBe('string');
    });

    it('should call next function', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should handle missing user-agent', () => {
      mockRequest.headers = {};

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Incoming request',
        expect.objectContaining({
          userAgent: 'unknown',
        }),
      );
    });

    it('should log completion with info level for 2xx status', () => {
      mockResponse.statusCode = 200;

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      // Trigger finish event
      (mockResponse as any).emit('finish');

      expect(mockLogger.log).toHaveBeenCalledWith(
        'info',
        'Request completed',
        expect.objectContaining({
          statusCode: 200,
          duration: expect.stringMatching(/\d+ms/),
        }),
      );
    });

    it('should log completion with warn level for 4xx status', () => {
      mockResponse.statusCode = 404;

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      (mockResponse as any).emit('finish');

      expect(mockLogger.log).toHaveBeenCalledWith(
        'warn',
        'Request completed',
        expect.objectContaining({
          statusCode: 404,
        }),
      );
    });

    it('should log completion with error level for 5xx status', () => {
      mockResponse.statusCode = 500;

      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      (mockResponse as any).emit('finish');

      expect(mockLogger.log).toHaveBeenCalledWith(
        'error',
        'Request completed',
        expect.objectContaining({
          statusCode: 500,
        }),
      );
    });

    it('should include duration in milliseconds', () => {
      middleware.use(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      (mockResponse as any).emit('finish');

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.any(String),
        'Request completed',
        expect.objectContaining({
          duration: expect.stringMatching(/^\d+ms$/),
        }),
      );
    });
  });
});
