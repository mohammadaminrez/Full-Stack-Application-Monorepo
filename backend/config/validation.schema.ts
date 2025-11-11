import * as Joi from 'joi';

/**
 * Validates environment variables at startup
 * Fails fast if required configuration is missing or invalid
 * This prevents running the app with invalid config
 */
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Gateway configuration
  GATEWAY_PORT: Joi.number().default(3000),

  // Authentication service configuration
  AUTH_HOST: Joi.string().default('localhost'),
  AUTH_PORT: Joi.number().default(3001),

  // Database - required in production, has fallback in dev
  MONGODB_URI: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // JWT - must be changed in production for security
  JWT_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().min(32),
    otherwise: Joi.string().optional(),
  }),
  JWT_EXPIRES_IN: Joi.string().default('24h'),

  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(10),

  // Cache
  CACHE_TTL: Joi.number().default(300),
  CACHE_MAX: Joi.number().default(100),
});
