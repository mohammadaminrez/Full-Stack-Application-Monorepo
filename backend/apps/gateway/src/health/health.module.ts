import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';

/**
 * Health Module
 * Provides health check endpoints for monitoring
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('authentication.host'),
            port: configService.get('authentication.port'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
