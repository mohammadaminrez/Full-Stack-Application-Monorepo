/**
 * TCP message patterns for microservice communication
 * Using consistent naming helps with debugging and maintenance
 * Pattern format: { cmd: 'service.action' }
 */
export const MESSAGE_PATTERNS = {
  // User management patterns
  USER_REGISTER: { cmd: 'user.register' },
  USER_CREATE: { cmd: 'user.create' },
  USER_FIND_ALL: { cmd: 'user.findAll' },
  USER_FIND_BY_CREATOR: { cmd: 'user.findByCreator' },
  USER_FIND_BY_EMAIL: { cmd: 'user.findByEmail' },
  USER_FIND_BY_ID: { cmd: 'user.findById' },
  USER_UPDATE: { cmd: 'user.update' },
  USER_DELETE: { cmd: 'user.delete' },
  USER_VALIDATE: { cmd: 'user.validate' },

  // Health check pattern
  HEALTH_CHECK: { cmd: 'health.check' },
} as const;
