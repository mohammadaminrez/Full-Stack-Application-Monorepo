import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
  // In production, always use specific origin from env variable
  const allowedOrigins =
    configService.get<string>('gateway.corsOrigin') || process.env.FRONTEND_URL;

  if (!allowedOrigins && configService.get('NODE_ENV') === 'production') {
    throw new Error('FRONTEND_URL must be set in production environment');
  }

  app.enableCors({
    origin: allowedOrigins
      ? allowedOrigins.split(',').map((o) => o.trim())
      : ['http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
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

  // Global exception filter for standardized error responses
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Aladia Full-Stack API')
    .setDescription('REST API Gateway for microservices-based authentication system')
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
