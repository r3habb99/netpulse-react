/**
 * NetPulse Error Handling Utilities
 * Centralized error handling and logging for the application
 */

import { ERRORS } from './constants';

export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  PERMISSION = 'PERMISSION',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface NetPulseError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: any;
  timestamp: number;
  stack?: string;
  context?: string;
}

/**
 * Create a standardized NetPulse error
 */
export const createError = (
  type: ErrorType,
  message: string,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  details?: any,
  context?: string
): NetPulseError => {
  return {
    type,
    severity,
    message,
    details,
    context,
    timestamp: Date.now(),
    stack: new Error().stack
  };
};

/**
 * Handle network-related errors
 */
export const handleNetworkError = (error: any, context?: string): NetPulseError => {
  let message: string = ERRORS.NETWORK_UNAVAILABLE;
  let severity = ErrorSeverity.HIGH;

  if (error instanceof TypeError && error.message.includes('fetch')) {
    message = 'Network request failed';
  } else if (error.name === 'AbortError') {
    message = 'Request was cancelled';
    severity = ErrorSeverity.LOW;
  } else if (error.status) {
    switch (error.status) {
      case 404:
        message = 'Resource not found';
        break;
      case 500:
        message = 'Server error';
        severity = ErrorSeverity.CRITICAL;
        break;
      case 503:
        message = 'Service unavailable';
        severity = ErrorSeverity.HIGH;
        break;
      default:
        message = `HTTP ${error.status}: ${error.statusText || 'Unknown error'}`;
    }
  }

  return createError(ErrorType.NETWORK, message, severity, error, context);
};

/**
 * Handle timeout errors
 */
export const handleTimeoutError = (context?: string): NetPulseError => {
  return createError(
    ErrorType.TIMEOUT,
    ERRORS.TEST_TIMEOUT,
    ErrorSeverity.MEDIUM,
    null,
    context
  );
};

/**
 * Handle permission errors
 */
export const handlePermissionError = (permission: string, context?: string): NetPulseError => {
  return createError(
    ErrorType.PERMISSION,
    `${ERRORS.PERMISSION_DENIED}: ${permission}`,
    ErrorSeverity.HIGH,
    { permission },
    context
  );
};

/**
 * Handle validation errors
 */
export const handleValidationError = (field: string, value: any, context?: string): NetPulseError => {
  return createError(
    ErrorType.VALIDATION,
    `Invalid value for ${field}: ${value}`,
    ErrorSeverity.LOW,
    { field, value },
    context
  );
};

/**
 * Handle unknown errors
 */
export const handleUnknownError = (error: any, context?: string): NetPulseError => {
  const message = error?.message || ERRORS.UNKNOWN_ERROR;
  
  return createError(
    ErrorType.UNKNOWN,
    message,
    ErrorSeverity.MEDIUM,
    error,
    context
  );
};

/**
 * Log error to console with formatting
 */
export const logError = (error: NetPulseError): void => {
  const prefix = `[NetPulse ${error.severity}]`;
  const timestamp = new Date(error.timestamp).toISOString();

  console.group(`${prefix} ${error.type} Error - ${timestamp}`);
  console.error(`Message: ${error.message}`);

  if (error.context) {
    console.error(`Context: ${error.context}`);
  }

  if (error.details) {
    console.error('Details:', error.details);
  }

  if (error.stack) {
    console.error('Stack:', error.stack);
  }

  console.groupEnd();
};

/**
 * Log info message to console (for success/status messages)
 */
export const logInfo = (message: string, context?: string, details?: any): void => {
  const timestamp = new Date().toISOString();
  const prefix = `[NetPulse INFO]`;

  if (process.env.NODE_ENV === 'development') {
    console.group(`${prefix} - ${timestamp}`);
    console.info(`Message: ${message}`);

    if (context) {
      console.info(`Context: ${context}`);
    }

    if (details) {
      console.info('Details:', details);
    }

    console.groupEnd();
  }
};

/**
 * Report error to analytics or monitoring service
 */
export const reportError = async (error: NetPulseError): Promise<void> => {
  // In a real application, you would send this to your error tracking service
  // For now, we'll just log it
  logError(error);
  
  // Example: Send to analytics service
  // try {
  //   await fetch('/api/errors', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(error)
  //   });
  // } catch (reportingError) {
  //   console.error('Failed to report error:', reportingError);
  // }
};

/**
 * Error boundary helper for React components
 */
export const handleComponentError = (error: Error, errorInfo: any): NetPulseError => {
  const netPulseError = createError(
    ErrorType.UNKNOWN,
    `Component error: ${error.message}`,
    ErrorSeverity.HIGH,
    { error, errorInfo },
    'React Component'
  );
  
  reportError(netPulseError);
  return netPulseError;
};

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        const netPulseError = handleNetworkError(error, context);
        reportError(netPulseError);
        throw netPulseError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

/**
 * Timeout wrapper for promises
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  context?: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        const timeoutError = handleTimeoutError(context);
        reportError(timeoutError);
        reject(timeoutError);
      }, timeoutMs);
    })
  ]);
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ success: true; data: T } | { success: false; error: NetPulseError }> => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    let netPulseError: NetPulseError;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        netPulseError = handleTimeoutError(context);
      } else if (error.message.includes('fetch')) {
        netPulseError = handleNetworkError(error, context);
      } else {
        netPulseError = handleUnknownError(error, context);
      }
    } else {
      netPulseError = handleUnknownError(error, context);
    }
    
    reportError(netPulseError);
    return { success: false, error: netPulseError };
  }
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error: NetPulseError): string => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Network connection issue. Please check your internet connection and try again.';
    
    case ErrorType.TIMEOUT:
      return 'The operation took too long to complete. Please try again.';
    
    case ErrorType.PERMISSION:
      return 'Permission required. Please allow the requested permission and try again.';
    
    case ErrorType.VALIDATION:
      return 'Invalid input. Please check your data and try again.';
    
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Check if error is recoverable
 */
export const isRecoverableError = (error: NetPulseError): boolean => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return true; // Network issues can often be resolved by retrying
    
    case ErrorType.TIMEOUT:
      return true; // Timeouts can be resolved by retrying
    
    case ErrorType.PERMISSION:
      return false; // Permission errors require user action
    
    case ErrorType.VALIDATION:
      return false; // Validation errors require fixing the input
    
    default:
      return false; // Unknown errors are not automatically recoverable
  }
};

/**
 * Global error handler for unhandled promise rejections
 */
export const setupGlobalErrorHandling = (): void => {
  window.addEventListener('unhandledrejection', (event) => {
    const error = handleUnknownError(event.reason, 'Unhandled Promise Rejection');
    reportError(error);
    event.preventDefault();
  });
  
  window.addEventListener('error', (event) => {
    const error = handleUnknownError(event.error, 'Global Error Handler');
    reportError(error);
  });
};
