/**
 * Onboarding API Error Handling
 * 
 * Standardized error types and utilities for onboarding workflow.
 */

export class OnboardingError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly statusCode?: number,
    ) {
        super(message)
        this.name = 'OnboardingError'
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
export function getOnboardingErrorMessage(error: unknown): string {
    if (error instanceof OnboardingError) {
        return error.message
    }
    
    if (error instanceof ValidationError) {
        return error.message
    }
    
    if (error instanceof Error) {
        return error.message
    }
    
    return 'An unexpected error occurred while processing the onboarding request'
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
    return error instanceof ValidationError
}

/**
 * Check if error is a permission error (403)
 */
export function isPermissionError(error: unknown): boolean {
    if (error instanceof OnboardingError) {
        return error.statusCode === 403
    }
    
    // Check axios errors
    if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        return axiosError.response?.status === 403
    }
    
    return false
}

