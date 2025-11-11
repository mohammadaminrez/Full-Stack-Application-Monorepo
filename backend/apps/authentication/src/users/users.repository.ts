import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * Users Repository - Data access layer
 * Handles all database operations for users
 * Follows Repository pattern to separate business logic from data access
 */
@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  /**
   * Create a new user with hashed password
   * Throws ConflictException if email already exists
   */
  async create(registerDto: RegisterUserDto): Promise<User> {
    try {
      // Hash password before storing (never store plain text passwords)
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = new this.userModel({
        ...registerDto,
        password: hashedPassword,
      });

      return await user.save();
    } catch (error) {
      // MongoDB duplicate key error (email already exists)
      if (error.code === 11000) {
        throw new ConflictException('Email already registered');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  /**
   * Find all users
   * Returns empty array if no users exist
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  /**
   * Find user by email (including password for authentication)
   * Returns null if user not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Validate user credentials
   * Returns user if credentials are valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }

    // Compare provided password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
