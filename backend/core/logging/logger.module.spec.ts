import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from './logger.module';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

describe('LoggerModule', () => {
  let module: TestingModule;
  let logger: Logger;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [LoggerModule],
    }).compile();

    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide winston logger', () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
  });

  it('should have console transport', () => {
    const transports = (logger as any).transports;
    expect(transports).toBeDefined();
    expect(transports.length).toBeGreaterThan(0);

    const hasConsoleTransport = transports.some(
      (transport: any) => transport.name === 'console',
    );
    expect(hasConsoleTransport).toBe(true);
  });

  it('should have file transports', () => {
    const transports = (logger as any).transports;

    const hasFileTransport = transports.some(
      (transport: any) => transport.name === 'file',
    );
    expect(hasFileTransport).toBe(true);
  });

  it('should log messages successfully', () => {
    // This should not throw
    expect(() => {
      logger.info('Test info message');
      logger.error('Test error message');
      logger.warn('Test warn message');
    }).not.toThrow();
  });

  it('should support structured logging', () => {
    // Test that logger accepts metadata
    expect(() => {
      logger.info('Test message', {
        context: 'TestContext',
        userId: '12345',
        action: 'test-action',
      });
    }).not.toThrow();
  });
});
