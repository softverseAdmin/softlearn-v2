/**
 * Error handling utilities for Phase 20 polish
 */

export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
  userMessage?: string
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  NOT_FOUND: 'NOT_FOUND',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_FILE: 'INVALID_FILE',

  // Permission errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Business logic errors
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_STATE: 'INVALID_STATE',

  // Unknown errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
}

/**
 * Create standardized error messages
 */
export function createError(
  code: string,
  message: string,
  userMessage?: string,
  details?: Record<string, unknown>
): AppError {
  return {
    code,
    message,
    userMessage: userMessage || message,
    details,
    timestamp: new Date(),
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: AppError | Error | string): string {
  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    if ('userMessage' in error) {
      const userMessage = (error as Error & { userMessage?: unknown }).userMessage
      return typeof userMessage === 'string' ? userMessage : error.message
    }
    return error.message
  }

  return error.userMessage || error.message || 'An unexpected error occurred'
}

/**
 * Handle async operations with error handling
 */
export async function handleAsync<T>(
  fn: () => Promise<T>
): Promise<[T | null, AppError | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    const appError = normalizeError(error)
    return [null, appError]
  }
}

/**
 * Normalize various error types to AppError
 */
export function normalizeError(error: unknown): AppError {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as { code: unknown }).code === 'string' &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const appError = error as Partial<AppError> & { code: string; message: string }
    return {
      code: appError.code,
      message: appError.message,
      details: appError.details,
      timestamp: appError.timestamp instanceof Date ? appError.timestamp : new Date(),
      userMessage: typeof appError.userMessage === 'string' ? appError.userMessage : appError.message,
    }
  }

  if (error instanceof Error) {
    return createError(
      ErrorCodes.UNKNOWN_ERROR,
      error.message,
      'An unexpected error occurred. Please try again.'
    )
  }

  if (typeof error === 'string') {
    return createError(
      ErrorCodes.UNKNOWN_ERROR,
      error,
      error
    )
  }

  return createError(
    ErrorCodes.UNKNOWN_ERROR,
    'Unknown error',
    'An unexpected error occurred. Please try again.'
  )
}

/**
 * Retry logic with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | unknown

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Debounce with error handling
 */
export function withErrorDebounce<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  delay = 300,
  onError?: (error: AppError) => void
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(async () => {
      try {
        await fn(...args)
      } catch (error) {
        const appError = normalizeError(error)
        onError?.(appError)
      }
    }, delay)
  }
}

export default {
  createError,
  formatErrorMessage,
  handleAsync,
  normalizeError,
  withRetry,
  withErrorDebounce,
  ErrorCodes,
}
