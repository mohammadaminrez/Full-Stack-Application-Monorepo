import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpExceptionFilter,
  StandardErrorResponse,
} from './http-exception.filter';
import {
  HttpException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      url: '/api/test',
      headers: {
        'x-request-id': 'test-request-id',
      },
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
      getArgByIndex: jest.fn(),
      getArgs: jest.fn(),
      getType: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should format BadRequestException correctly', () => {
      const exception = new BadRequestException('Validation failed');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Validation failed',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should format UnauthorizedException correctly', () => {
      const exception = new UnauthorizedException('Invalid token');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'Unauthorized',
        message: 'Invalid token',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should format NotFoundException correctly', () => {
      const exception = new NotFoundException('User not found');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'User not found',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should format ConflictException correctly', () => {
      const exception = new ConflictException('Email already exists');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'Email already exists',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should format InternalServerErrorException correctly', () => {
      const exception = new InternalServerErrorException('Server error');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Server error',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should handle validation error with array of messages', () => {
      const exception = new BadRequestException({
        message: ['name is required', 'email is invalid'],
        error: 'VALIDATION_ERROR',
      });

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'VALIDATION_ERROR',
        message: ['name is required', 'email is invalid'],
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should handle exception with custom error code', () => {
      const exception = new HttpException(
        {
          message: 'Rate limit exceeded',
          error: 'RATE_LIMIT_EXCEEDED',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should handle string exception response', () => {
      const exception = new HttpException('Simple error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'BAD_REQUEST',
        message: 'Simple error',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should include timestamp in ISO format', () => {
      const exception = new BadRequestException('Test');

      filter.catch(exception, mockArgumentsHost);

      const callArgs = mockResponse.json.mock.calls[0][0];
      const timestamp = new Date(callArgs.timestamp);

      expect(timestamp.toISOString()).toBe(callArgs.timestamp);
    });

    it('should handle request without request ID', () => {
      mockRequest.headers = {};

      const exception = new BadRequestException('Test');

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: undefined,
        }),
      );
    });

    it('should map unknown status code to UNKNOWN_ERROR', () => {
      const exception = new HttpException('Unknown error', 418); // I'm a teapot

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 418,
        error: 'UNKNOWN_ERROR',
        message: 'Unknown error',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });

    it('should handle exception with no message property', () => {
      const exception = new HttpException({}, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost);

      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'BAD_REQUEST',
        message: 'An error occurred',
        timestamp: expect.any(String),
        path: '/api/test',
        requestId: 'test-request-id',
      });
    });
  });
});
