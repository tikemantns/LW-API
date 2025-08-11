import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'
import mongoose from 'mongoose'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { AppError } from '../types'

/**
 * Enhanced error handler with improved security and error normalization
 * - Prevents leaking sensitive error details in production
 * - Standardizes error responses
 * - Properly handles different types of errors
 */
const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
    let statusCode = err.statusCode || 500
    let message = err.message || 'Internal Server Error'
    let errorCode = 'INTERNAL_ERROR'

    // Track if error is operational (expected) or programming error
    const isOperational = err.isOperational || false

    // Extract request context for logging
    const reqInfo = {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userId: (req as any).user?.userId || 'anonymous',
        requestId: req.headers['x-request-id'] || '-',
    }

    // Handle specific error types
    if (err instanceof mongoose.Error.ValidationError) {
        // Mongoose validation error
        statusCode = 400
        errorCode = 'VALIDATION_ERROR'

        // Format validation errors
        const validationErrors = Object.values(err.errors || {}).map((e) => ({
            field: e.path,
            message: e.message,
            value: e.value,
        }))

        message = 'Validation failed'

        // Log detailed validation errors for debugging
        logger.warn(`${errorCode}: ${message} for ${reqInfo.method} ${reqInfo.path}`, {
            errors: validationErrors,
            userId: reqInfo.userId,
            requestId: reqInfo.requestId,
        })

        return res.status(statusCode).json({
            success: false,
            error: message,
            errorCode,
            validationErrors: process.env.NODE_ENV !== 'production' ? validationErrors : undefined,
        })
    } else if (err instanceof mongoose.Error.CastError) {
        // Mongoose cast error (e.g., invalid ObjectId)
        statusCode = 400
        errorCode = 'INVALID_DATA_FORMAT'
        message = `Invalid ${err.path}: ${err.value}`

        if (err.kind === 'ObjectId') {
            message = 'Invalid ID format'
        }
    } else if (err.name === 'MongoServerError') {
        // MongoDB server errors
        if (err.code === 11000) {
            // Duplicate key error
            statusCode = 409
            errorCode = 'DUPLICATE_ENTRY'

            // Extract the duplicate key field
            const field = Object.keys(err.keyPattern || {})[0] || 'field'
            message = `A record with this ${field} already exists`
        } else {
            // Other MongoDB errors
            statusCode = 500
            errorCode = 'DATABASE_ERROR'
            message = 'Database operation failed'
        }
    } else if (err instanceof TokenExpiredError) {
        // JWT token expired
        statusCode = 401
        errorCode = 'TOKEN_EXPIRED'
        message = 'Your session has expired. Please log in again.'
    } else if (err instanceof JsonWebTokenError) {
        // JWT token invalid
        statusCode = 403
        errorCode = 'INVALID_TOKEN'
        message = 'Invalid authentication token'
    } else if (err.name === 'SyntaxError' && (err as any).type === 'entity.parse.failed') {
        // JSON parsing error
        statusCode = 400
        errorCode = 'INVALID_JSON'
        message = 'Invalid JSON in request body'
    }

    // Log error with appropriate severity
    if (statusCode >= 500) {
        // Server errors - high severity
        logger.error(`${errorCode} (${statusCode}): ${message}`, {
            ...reqInfo,
            stack: err.stack,
            isOperational,
        })
    } else if (statusCode >= 400) {
        // Client errors - medium severity
        logger.warn(`${errorCode} (${statusCode}): ${message}`, {
            ...reqInfo,
            isOperational,
        })
    }

    // Prepare response
    // In production, normalize error messages for security
    const responseMessage =
        process.env.NODE_ENV === 'production' && statusCode >= 500 && !isOperational
            ? 'Internal Server Error' // Generic message for unexpected server errors in production
            : message

    // Send response
    res.status(statusCode).json({
        success: false,
        error: responseMessage,
        errorCode,
        // Only include stack trace in development for non-operational errors
        ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack }),
    })
}

export default errorHandler
