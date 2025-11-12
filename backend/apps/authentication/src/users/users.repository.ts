import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { RegisterUserDto } from '@app/common/dto/register-user.dto';
import { CreateUserDto } from '@app/common/dto/create-user.dto';
import { UpdateUserDto } from '@app/common/dto/update-user.dto';
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
   * Create a new user with hashed password (for registration - no creator)
   * Throws ConflictException if email already exists
   */
  async create(registerDto: RegisterUserDto): Promise<User> {
    try {
      // Hash password before storing (never store plain text passwords)
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const user = new this.userModel({
        ...registerDto,
        password: hashedPassword,
        createdBy: null, // Self-registered users have no creator
      });

      return await user.save();
    } catch (error) {
      // MongoDB duplicate key error (email already exists)
      if (error.code === 11000) {
        throw new ConflictException('Email already registered');
      }
      throw new InternalServerErrorException(
        `Failed to register user: ${error.message || 'Database error'}`,
      );
    }
  }

  /**
   * Create a new user by an authenticated user
   * Sets createdBy to the creator's ID
   */
  async createByUser(createUserDto: CreateUserDto, creatorId: string): Promise<User> {
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        createdBy: new Types.ObjectId(creatorId),
      });

      return await user.save();
    } catch (error) {
      // MongoDB duplicate key error (email already exists)
      if (error.code === 11000) {
        throw new ConflictException('Email already registered');
      }
      throw new InternalServerErrorException(
        `Failed to create user: ${error.message || 'Database error'}`,
      );
    }
  }

  /**
   * Find all users (admin function - not filtered)
   * Returns empty array if no users exist
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  /**
   * Find users created by a specific user
   * Returns only users that were added by the given creator
   */
  async findByCreator(creatorId: string): Promise<User[]> {
    return this.userModel
      .find({ createdBy: new Types.ObjectId(creatorId) })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find user by ID
   * Returns null if user not found
   */
  async findById(userId: string): Promise<User | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }
    return this.userModel.findById(userId).select('-password').exec();
  }

  /**
   * Find user by email (including password for authentication)
   * Returns null if user not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Update user information
   * Only the creator can update their created users
   */
  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    creatorId: string,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('User not found');
    }

    // Find user and verify ownership
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(userId),
      createdBy: new Types.ObjectId(creatorId),
    });

    if (!user) {
      throw new NotFoundException(
        'User not found or you do not have permission to update this user',
      );
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    Object.assign(user, updateUserDto);
    return await user.save();
  }

  /**
   * Delete a user
   * Only the creator can delete their created users
   */
  async delete(userId: string, creatorId: string): Promise<void> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('User not found');
    }

    const result = await this.userModel.deleteOne({
      _id: new Types.ObjectId(userId),
      createdBy: new Types.ObjectId(creatorId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'User not found or you do not have permission to delete this user',
      );
    }
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
