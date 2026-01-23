import { z } from 'zod'
import type { AxiosError, AxiosResponse } from 'axios'

/**
 * Standard backend API response schemas
 * Based on ApiResponse trait from Laravel backend
 */

/**
 * Success response with optional data
 */
export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) => {
  return z.object({
    message: z.string(),
    data: dataSchema ? dataSchema.optional() : z.any().optional(),
  })
}

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.object({
    message: z.string(),
    data: z.array(itemSchema),
    meta: z.object({
      currentPage: z.number(),
      lastPage: z.number().optional(),
      perPage: z.number().optional(),
      total: z.number().optional(),
    }),
    links: z.object({
      first: z.string().url().nullable().optional(),
      last: z.string().url().nullable().optional(),
      prev: z.string().url().nullable().optional(),
      next: z.string().url().nullable().optional(),
    }),
  })
}

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  status: z.number().optional(),
  fields: z.record(z.string(), z.string()).optional(),
})

/**
 * Extract data from backend response
 * Handles all response formats:
 * - { message: "..." } (simple success)
 * - { message: "...", data: {...} } (success with data)
 * - { message: "...", data: [...], meta: {...}, links: {...} } (paginated)
 */
export function extractData<T>(response: AxiosResponse): T | null {
  const responseData = response.data

  // Handle paginated response
  if (responseData?.data && Array.isArray(responseData.data) && responseData.meta) {
    return responseData as T
  }

  // Handle success with data
  if (responseData?.data !== undefined) {
    return responseData.data as T
  }

  // Handle simple success (no data)
  if (responseData?.message) {
    return null as T
  }

  // Fallback: return entire response
  return responseData as T
}

/**
 * Extract error from backend response
 * Handles error format: { error: "...", message: "...", fields: {...} }
 */
export function extractError(error: unknown): {
  error: string
  message: string
  fields?: Record<string, string>
  status?: number
} {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError
    const errorData = axiosError.response?.data

    if (errorData && typeof errorData === 'object') {
      const result = errorResponseSchema.safeParse(errorData)
      if (result.success) {
        return {
          error: result.data.error,
          message: result.data.message,
          fields: result.data.fields,
          status: result.data.status || axiosError.response?.status,
        }
      }
    }

    // Fallback for non-standard error responses
    return {
      error: 'REQUEST_ERROR',
      message: axiosError.message || 'An error occurred',
      status: axiosError.response?.status,
    }
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      error: 'UNKNOWN_ERROR',
      message: error.message,
    }
  }

  return {
    error: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  }
}

/**
 * Validate and extract data from response
 * Uses Zod schema for validation
 */
export function validateAndExtract<T>(
  response: AxiosResponse,
  schema: z.ZodType<T>
): T {
  const data = extractData(response)
  
  if (data === null) {
    throw new Error('Response contains no data')
  }

  const result = schema.safeParse(data)
  if (!result.success) {
    console.error('Response validation failed:', result.error.issues)
    console.error('Received data:', JSON.stringify(data, null, 2))
    throw new Error(`Invalid response: ${result.error.message}`)
  }

  return result.data
}

/**
 * Validate paginated response
 */
export function validatePaginatedResponse<T>(
  response: AxiosResponse,
  itemSchema: z.ZodType<T>
) {
  const responseData = response.data
  const schema = paginatedResponseSchema(itemSchema)
  
  const result = schema.safeParse(responseData)
  if (!result.success) {
    console.error('Paginated response validation failed:', result.error.issues)
    console.error('Received data:', JSON.stringify(responseData, null, 2))
    throw new Error(`Invalid paginated response: ${result.error.message}`)
  }

  return result.data
}

