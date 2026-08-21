/**
 * Standard API Response Formatting
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export function sendSuccess<T>(
  data: T,
  pagination?: ApiResponse['pagination']
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (pagination) {
    response.pagination = pagination;
  }
  return response;
}

export function sendError(
  code: string,
  message: string,
  details?: any
): ApiResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    response.error!.details = details;
  }
  return response;
}
