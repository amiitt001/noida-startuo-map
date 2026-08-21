/**
 * Custom Application Errors
 */

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden: insufficient permissions') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(409, 'CONFLICT', message);
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests, please try again later') {
    super(429, 'RATE_LIMITED', message);
  }
}
