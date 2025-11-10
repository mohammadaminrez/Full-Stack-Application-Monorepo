import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

/**
 * Authentication Microservice Bootstrap
 * This service communicates via TCP (not HTTP)
 * Handles user authentication and data persistence
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService);

  // Use Winston for logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Enable validation globally for all DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error for unexpected properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );

  // Connect microservice transport (TCP)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.get('authentication.host'),
      port: configService.get('authentication.port'),
    },
  });

  await app.startAllMicroservices();

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(
    `Authentication service listening on ${configService.get('authentication.host')}:${configService.get('authentication.port')}`,
    'Bootstrap',
  );
}

bootstrap();
