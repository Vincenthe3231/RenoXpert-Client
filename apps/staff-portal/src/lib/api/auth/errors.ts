/**
 * Auth API Error Handling
 * 
 * Standardized error types and utilities for authentication and user management.
 */

export class AuthError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly statusCode?: number,
    ) {
        super(message)
        this.name = 'AuthError'
    }
}

export class ValidationError extends Error {
    constructor(
        message: string,
        public readonly issues?: Array<{ path: string; message: string }>,
    ) {
        super(message)
        this.name = 'ValidationError'
    }
}

/**
 * Create a user-friendly error message from an API error
 */
export function getAuthErrorMessage(error: unknown): string {
    if (error instanceof AuthError) {
        return error.message
    }
    
    if (error instanceof ValidationError) {
        return error.message
    }
    
    if (error instanceof Error) {
        return error.message
    }
    
    return 'An unexpected error occurred'
}

/**
 * Check if error is an authentication error (401)
 */
export function isAuthError(error: unknown): boolean {
    if (error instanceof AuthError) {
        return error.statusCode === 401
    }
    
    // Check axios errors
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        return axiosError.response?.status === 401
    }
    
    return false
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    return error instanceof ValidationError
}

