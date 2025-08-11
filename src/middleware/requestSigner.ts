import { Response, NextFunction } from 'express'
import { createHmac, timingSafeEqual } from 'crypto'
import { AuthRequest } from '../types'
import logger from '../utils/logger'

// Threshold for request timestamp validity (in seconds)
const REQUEST_TIMESTAMP_THRESHOLD = 300 // 5 minutes

/**
 * Middleware for verifying signed API requests
 *
 * Required headers:
 * - X-Request-Timestamp: Unix timestamp when the request was initiated
 * - X-Request-Signature: HMAC signature of request data
 *
 * The signature is computed as:
 * HMAC-SHA256(API_KEY_SECRET, timestamp + method + url + body)
 */
export const verifyRequestSignature = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Skip signature verification for:
    // - Health check endpoint
    // - Public routes
    // - Swagger documentation
    if (
        req.path === '/health' ||
        req.path === '/healthcheck' ||
        req.path.startsWith('/api/v1/public') ||
        req.path.startsWith('/api-docs')
    ) {
        return next()
    }

    // Only verify in production environment
    if (process.env.NODE_ENV !== 'production' && process.env.ENFORCE_REQUEST_SIGNING !== 'true') {
        return next()
    }

    try {
        const timestamp = req.header('X-Request-Timestamp')
        const signature = req.header('X-Request-Signature')

        if (!timestamp || !signature) {
            return res.status(401).json({
                success: false,
                error: 'Missing required signature headers',
            })
        }

        // Verify timestamp is recent
        const currentTime = Math.floor(Date.now() / 1000)
        const requestTime = parseInt(timestamp, 10)

        if (
            isNaN(requestTime) ||
            Math.abs(currentTime - requestTime) > REQUEST_TIMESTAMP_THRESHOLD
        ) {
            return res.status(401).json({
                success: false,
                error: 'Request timestamp expired or invalid',
            })
        }

        // Compute the expected signature
        const apiSecret = process.env.API_KEY_SECRET || 'your_default_api_secret_for_development'
        const body = req.method !== 'GET' && req.body ? JSON.stringify(req.body) : ''
        const data = `${timestamp}${req.method}${req.originalUrl}${body}`
        const expectedSignature = createHmac('sha256', apiSecret).update(data).digest('hex')

        // Constant-time comparison to prevent timing attacks
        const signatureBuffer = Buffer.from(signature)
        const expectedBuffer = Buffer.from(expectedSignature)

        if (
            signatureBuffer.length !== expectedBuffer.length ||
            !timingSafeEqual(signatureBuffer, expectedBuffer)
        ) {
            logger.warn(
                `Invalid request signature for ${req.method} ${req.originalUrl} from ${req.ip}`
            )
            return res.status(401).json({
                success: false,
                error: 'Invalid request signature',
            })
        }

        logger.debug(`✅ Request signature verified for ${req.method} ${req.originalUrl}`)
        next()
    } catch (error) {
        logger.error('Error verifying request signature:', error)
        res.status(500).json({
            success: false,
            error: 'Error verifying request signature',
        })
    }
}
