import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

/**
 * Gateway Service Bootstrap
 * HTTP API entry point for all client requests
 * Includes Swagger documentation and global configuration
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Use Winston for logging
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Enable CORS for frontend access
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Configure in production
    credentials: true,
  });

  // Global API prefix
  app.setGlobalPrefix(configService.get<string>('gateway.globalPrefix') || 'api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Aladia Full-Stack API')
    .setDescription(
      'REST API Gateway for microservices-based authentication system',
    )
    .setVersion('1.0')
    .addTag('Authentication', 'User registration and authentication endpoints')
    .addTag('Health', 'Service health and readiness probes')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('gateway.port');
  await app.listen(port);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  logger.log(`Gateway service running on http://localhost:${port}`, 'Bootstrap');
  logger.log(
    `Swagger documentation available at http://localhost:${port}/api`,
    'Bootstrap',
  );
}

bootstrap();
