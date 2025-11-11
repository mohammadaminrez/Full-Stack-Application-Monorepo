/**
 * TCP message patterns for microservice communication
 * Using consistent naming helps with debugging and maintenance
 * Pattern format: { cmd: 'service.action' }
 */
export const MESSAGE_PATTERNS = {
  // User management patterns
  USER_REGISTER: { cmd: 'user.register' },
  USER_FIND_ALL: { cmd: 'user.findAll' },

  // Health check pattern
  HEALTH_CHECK: { cmd: 'health.check' },
} as const;
