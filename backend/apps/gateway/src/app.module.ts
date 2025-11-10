import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from '@app/core/config/config.module';
import { LoggerModule } from '@app/core/logging/logger.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

/**
 * Gateway Service Root Module
 * Handles all HTTP requests and routes to microservices
 * Includes rate limiting and caching for performance
 */
@Module({
  imports: [
    // Core modules
    AppConfigModule,
    LoggerModule,

    // Rate limiting (prevent abuse)
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('throttle.ttl'),
          limit: configService.get('throttle.limit'),
        },
      ],
      inject: [ConfigService],
    }),

    // Caching (improve performance)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('cache.ttl'),
        max: configService.get('cache.max'),
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    HealthModule,
  ],
  providers: [
    // Apply rate limiting globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
