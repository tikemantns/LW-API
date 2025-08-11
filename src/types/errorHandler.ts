/**
 * Types for error handling middleware
 */

export interface AppError extends Omit<Error, 'name'> {
    statusCode?: number
    isOperational?: boolean
    code?: string | number
    keyPattern?: Record<string, any>
    errors?: Record<string, any>
    name: string // Make name required to match Error interface
    kind?: string
    path?: string
    value?: any
}
