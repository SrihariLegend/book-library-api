import type { ApiResponse, ApiMeta } from '../types/api-response';

export function buildSuccess<T>(data: T): ApiResponse<T> {
  return Object.freeze({
    success: true,
    data,
    error: null,
  });
}

export function buildError(message: string): ApiResponse<never> {
  return Object.freeze({
    success: false,
    data: null,
    error: message,
  });
}

export function buildPaginated<T>(
  data: T,
  meta: ApiMeta
): {
  success: true;
  data: T;
  error: null;
  meta: ApiMeta;
} {
  return Object.freeze({
    success: true,
    data,
    error: null,
    meta: Object.freeze({ ...meta }),
  });
}
