import { Module } from '@nestjs/common';
import { AppConfigModule } from '@app/core/config/config.module';
import { DatabaseModule } from '@app/core/database/database.module';
import { LoggerModule } from '@app/core/logging/logger.module';
import { UsersModule } from './users/users.module';

/**
 * Authentication Service Root Module
 * Aggregates all feature modules and core dependencies
 * This service handles business logic and data persistence
 */
@Module({
  imports: [
    // Core modules
    AppConfigModule, // Configuration management
    DatabaseModule, // MongoDB connection
    LoggerModule, // Winston logging

    // Feature modules
    UsersModule, // User management
  ],
})
export class AppModule {}
