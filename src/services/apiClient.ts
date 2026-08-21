/**
 * Centralized API Client
 *
 * All frontend HTTP communication with the Express backend goes through this client.
 * Configured with `credentials: 'include'` for HTTP-only cookie authentication.
 */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

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

async function handleResponse<T>(response: Response): Promise<{ data: T; pagination?: Pagination }> {
  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch (_e) {
    throw new ApiError(response.status, 'PARSING_ERROR', 'Failed to parse JSON response from server');
  }

  if (!response.ok || !json.success) {
    const code = json.error?.code || `HTTP_${response.status}`;
    const message = json.error?.message || response.statusText || 'An unexpected API error occurred';
    throw new ApiError(response.status, code, message, json.error?.details);
  }

  return {
    data: json.data,
    pagination: json.pagination,
  };
}

export const apiClient = {
  async get<T>(path: string, options?: RequestInit & { signal?: AbortSignal }): Promise<{ data: T; pagination?: Pagination }> {
    const response = await fetch(path, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
      signal: options?.signal,
      ...options,
    });
    return handleResponse<T>(response);
  },

  async post<T>(path: string, body?: any, options?: RequestInit): Promise<{ data: T; pagination?: Pagination }> {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  },

  async patch<T>(path: string, body?: any, options?: RequestInit): Promise<{ data: T; pagination?: Pagination }> {
    const response = await fetch(path, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(path: string, options?: RequestInit): Promise<{ data: T; pagination?: Pagination }> {
    const response = await fetch(path, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
      ...options,
    });
    return handleResponse<T>(response);
  },
};
