/**
 * Central configuration management
 * Loads and validates environment variables for all microservices
 */
export default () => ({
  // Application environment
  nodeEnv: process.env.NODE_ENV || 'development',

  // Gateway service configuration
  gateway: {
    port: parseInt(process.env.GATEWAY_PORT, 10) || 3000,
    globalPrefix: 'api',
  },

  // Authentication microservice configuration
  authentication: {
    host: process.env.AUTH_HOST || 'localhost',
    port: parseInt(process.env.AUTH_PORT, 10) || 3001,
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aladia',
    options: {
      // Connection pool helps with performance under load
      maxPoolSize: 10,
      minPoolSize: 2,
    },
  },

  // JWT configuration for authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Rate limiting to prevent abuse
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000, // 1 minute
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10, // 10 requests per minute
  },

  // Cache configuration for performance
  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes default
    max: parseInt(process.env.CACHE_MAX, 10) || 100, // Maximum items in cache
  },
});
