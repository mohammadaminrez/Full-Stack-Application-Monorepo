import { NestFactory } from '@nestjs/core';
import { AppModule as AuthModule } from '../apps/authentication/src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../apps/authentication/src/users/schemas/user.schema';

/**
 * Script to ensure all database indexes are created
 * Run this after deploying to production to fix the unique constraint
 */
async function ensureIndexes() {
  console.log('🔧 Ensuring database indexes...');

  const app = await NestFactory.createApplicationContext(AuthModule);

  try {
    const userModel = app.get(getModelToken(User.name));

    // Sync indexes - this will create missing indexes
    await userModel.syncIndexes();

    console.log('✅ Database indexes ensured successfully');

    // List all indexes
    const indexes = await userModel.collection.getIndexes();
    console.log('\n📋 Current indexes:');
    console.log(JSON.stringify(indexes, null, 2));

  } catch (error) {
    console.error('❌ Failed to ensure indexes:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

ensureIndexes();
