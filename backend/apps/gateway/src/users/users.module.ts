import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';

/**
 * Users Module - User Management
 * Handles CRUD operations for users created by authenticated users
 */
@Module({
  imports: [
    // Connect to authentication microservice via TCP
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('auth.host'),
            port: configService.get<number>('auth.port'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [UsersController],
})
export class UsersModule {}
