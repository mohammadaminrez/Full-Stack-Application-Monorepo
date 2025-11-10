import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { validationSchema } from '../../config/validation.schema';

/**
 * Centralized configuration module
 * Wraps NestJS ConfigModule with our custom configuration
 * Validates environment variables on startup to catch issues early
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere without importing
      load: [configuration],
      validationSchema,
      validationOptions: {
        abortEarly: false, // Show all validation errors, not just first one
      },
    }),
  ],
  exports: [NestConfigModule],
})
export class AppConfigModule {}
