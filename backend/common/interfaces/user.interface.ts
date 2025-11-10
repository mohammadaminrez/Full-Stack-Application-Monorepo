import { Document } from 'mongoose';

/**
 * User interface for type safety across services
 * Extends Mongoose Document for database operations
 */
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
