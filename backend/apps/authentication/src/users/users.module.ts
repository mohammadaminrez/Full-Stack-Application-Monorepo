import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { User, UserSchema } from './schemas/user.schema';

/**
 * Users Module
 * Encapsulates all user-related functionality
 * Follows NestJS modular architecture for clean separation
 */
@Module({
  imports: [
    // Register User schema with Mongoose
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService], // Export service for use in other modules if needed
})
export class UsersModule {}
