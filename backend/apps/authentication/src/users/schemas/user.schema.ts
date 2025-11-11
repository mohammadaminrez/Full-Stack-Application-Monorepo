import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * User schema for MongoDB
 * Defines the structure and validation rules for user documents
 * Each user can be created by another user (createdBy relationship)
 */
@Schema({
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'users',
})
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    lowercase: true, // Normalize email to lowercase
    trim: true,
    index: true, // Index for faster lookups
  })
  email: string;

  @Prop({
    required: true,
    // Password is hashed, so length validation happens before hashing
  })
  password: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
    index: true, // Index for filtering by creator
  })
  createdBy: Types.ObjectId | null;

  // Timestamps added automatically by Mongoose
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add composite index for filtering users by creator
UserSchema.index({ createdBy: 1, createdAt: -1 });
