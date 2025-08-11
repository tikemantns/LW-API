// This file exports custom TypeScript types and interfaces used throughout the application.

// Re-export all types
export * from './common'
export * from './auth'
export * from './errorHandler'
export * from './redis'
export * from './performance'
export * from './lw'

// Legacy API types
export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export interface PaginationQuery {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}
