/**
 * Security Audit Logger
 *
 * Logs security-relevant events (authentication failures, authorization failures,
 * admin mutations, submission rejections, rate limits) without logging secrets,
 * passwords, or cookies.
 */

export interface SecurityEvent {
  event: string;
  userId?: string;
  email?: string;
  ip?: string;
  path?: string;
  details?: Record<string, any>;
  timestamp?: string;
}

export const logger = {
  info(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },

  warn(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(meta) : '');
    }
  },

  error(message: string, error?: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    }
  },

  security(event: SecurityEvent) {
    const logData = {
      type: 'SECURITY_EVENT',
      event: event.event,
      userId: event.userId || 'anonymous',
      email: event.email,
      ip: event.ip,
      path: event.path,
      details: event.details,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    if (process.env.NODE_ENV !== 'test') {
      console.log(`[SECURITY] ${logData.timestamp} | ${event.event} | User: ${logData.userId} | IP: ${logData.ip || 'unknown'}`, logData.details || '');
    }
  },
};
