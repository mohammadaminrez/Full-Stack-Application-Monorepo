import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * User schema for MongoDB
 * Defines the structure and validation rules for user documents
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

  // Timestamps added automatically by Mongoose
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add index for email lookups (common operation)
UserSchema.index({ email: 1 });
