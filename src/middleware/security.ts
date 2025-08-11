import { Request, Response, NextFunction, Application, RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import { randomBytes } from 'crypto'
import logger from '../utils/logger'

/**
 * Custom XSS protection middleware
 * Sanitizes common XSS attack vectors from request data
 */
const customXSSProtection = (req: Request, res: Response, next: NextFunction): void => {
    const sanitizeString = (str: string): string => {
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<[^>]*>/g, '')
    }

    const sanitizeObject = (obj: unknown): unknown => {
        if (typeof obj === 'string') {
            return sanitizeString(obj)
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject)
        }
        if (obj && typeof obj === 'object') {
            const sanitized: Record<string, unknown> = {}
            for (const key in obj as Record<string, unknown>) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    sanitized[key] = sanitizeObject((obj as Record<string, unknown>)[key])
                }
            }
            return sanitized
        }
        return obj
    }

    // Sanitize request body
    if (req.body) {
        req.body = sanitizeObject(req.body)
    }

    // Sanitize query parameters
    if (req.query) {
        req.query = sanitizeObject(req.query) as typeof req.query
    }

    // Sanitize route parameters
    if (req.params) {
        req.params = sanitizeObject(req.params) as typeof req.params
    }

    next()
}

/**
 * Custom key generator for rate limiting that handles IP addresses with ports
 * Extracts clean IP address from various formats including those with ports
 */
const createSafeKeyGenerator = () => {
    return (req: Request): string => {
        // Get IP from Express (already processed through trust proxy)
        let ip = req.ip || req.connection.remoteAddress || 'unknown'
        
        // Remove port number if present (e.g., "10.50.1.181:64892" -> "10.50.1.181")
        if (ip.includes(':') && !ip.includes('::')) {
            // IPv4 with port - remove everything after the last colon
            const lastColonIndex = ip.lastIndexOf(':')
            ip = ip.substring(0, lastColonIndex)
        }
        
        // Handle IPv6 addresses wrapped in brackets with ports [::1]:8080
        if (ip.startsWith('[') && ip.includes(']:')) {
            ip = ip.substring(1, ip.indexOf(']:'))
        }
        
        // Validate the IP format and fallback to unknown if invalid
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::/
        
        if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip) && ip !== 'unknown') {
            logger.warn(`Invalid IP format detected: ${req.ip}, using fallback`)
            ip = 'unknown'
        }
        
        return ip
    }
}

/**
 * Rate limiting middleware
 * - Protects against brute force and DoS attacks
 * - Configurable limits based on route type
 * - Custom key generator handles IP addresses with ports
 */
export const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
    max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10), // 1000 requests default
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: createSafeKeyGenerator(),
    message: { success: false, error: 'Too many requests, please try again later.' },
    handler: (req: Request, res: Response) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`)
        res.status(429).json({
            success: false,
            error: 'Too many requests, please try again later.',
        })
    },
})

// More restrictive rate limit for authentication attempts
export const authLimiter = rateLimit({
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour default
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '100', 10), // 100 attempts default
    keyGenerator: createSafeKeyGenerator(),
    message: { success: false, error: 'Too many authentication attempts, please try again later.' },
})

// Stricter rate limit for sensitive operations
export const sensitiveOpLimiter = rateLimit({
    windowMs: parseInt(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour default
    max: parseInt(process.env.SENSITIVE_RATE_LIMIT_MAX || '10', 10), // 10 operations default
    keyGenerator: createSafeKeyGenerator(),
})

// Enhanced security headers with Helmet
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ['\'self\''],
            scriptSrc: [
                '\'self\'',
                '\'unsafe-inline\'',
                'cdn.jsdelivr.net',
                'https://login.microsoftonline.com', // Allow Microsoft OAuth2
                'https://*.microsoftonline.com', // Allow Microsoft OAuth2 subdomains
            ],
            styleSrc: ['\'self\'', '\'unsafe-inline\'', 'cdn.jsdelivr.net'],
            imgSrc: ['\'self\'', 'data:', 'https:'],
            connectSrc: [
                '\'self\'',
                'https://login.microsoftonline.com', // Allow OAuth2 connections
                'https://*.microsoftonline.com', // Allow OAuth2 connections
            ],
            fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
            objectSrc: ['\'none\''],
            frameSrc: [
                '\'self\'',
                'https://login.microsoftonline.com', // Allow OAuth2 iframes
                'https://*.microsoftonline.com', // Allow OAuth2 iframes
            ],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable for OAuth2 compatibility
    crossOriginOpenerPolicy: false, // Disable for OAuth2 compatibility
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin for OAuth2
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'sameorigin' }, // Changed from 'deny' to 'sameorigin' for OAuth2
    hidePoweredBy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Changed for OAuth2 compatibility
    xssFilter: true,
})

// Generate and verify request nonces
export const nonceMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Generate a unique request ID for tracking
    req.headers['x-request-id'] = req.headers['x-request-id'] || randomBytes(16).toString('hex')

    // Log incoming request for audit trail
    logger.info(
        `${req.method} ${req.originalUrl} - IP: ${req.ip} - ID: ${req.headers['x-request-id']}`
    )

    next()
}

// Sanitize data to prevent MongoDB operator injection
export const sanitizeData = mongoSanitize()

// Protect against HTTP Parameter Pollution
export const preventParameterPollution = hpp() as unknown as RequestHandler

// Sanitize user input against XSS attacks
export const preventXSS = customXSSProtection

// Prevent request body tampering
export const verifyContentType = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        if (!req.is('application/json') && Object.keys(req.body).length > 0) {
            return res.status(415).json({
                success: false,
                error: 'Unsupported Media Type. Please send data as application/json',
            })
        }
    }
    next()
}

// Detect and block suspicious request patterns
export const requestScreening = (req: Request, res: Response, next: NextFunction) => {
    // Check for suspicious URL patterns
    const url = req.originalUrl.toLowerCase()

    // Block common attack patterns
    const suspiciousPatterns = [
        /admin/i,
        /backup/i,
        /config/i,
        /\.env/i,
        /wp-/i,
        /\.git/i,
        /\.sql/i,
        /union\s+select/i,
        /eval\(/i,
        /script>/i,
        /etc\/passwd/i,
    ]

    if (suspiciousPatterns.some((pattern) => pattern.test(url))) {
        logger.warn(`Blocked suspicious request: ${url} from IP: ${req.ip}`)
        return res.status(403).json({
            success: false,
            error: 'Forbidden',
        })
    }

    next()
}

// Combine all security middleware
export const applySecurityMiddleware = (app: Application) => {
    // Apply security headers
    app.use(securityHeaders)

    // Apply request nonce and logging
    app.use(nonceMiddleware)

    // Apply rate limiting (but not to OAuth2 redirect routes)
    app.use('/api/', (req, res, next) => {
        // Skip rate limiting for OAuth2 redirect
        if (req.path.includes('/oauth2-redirect.html')) {
            return next()
        }
        return apiLimiter(req, res, next)
    })

    app.use('/api/v1/auth', authLimiter)
    app.use('/api/v1/product-specs/:id', sensitiveOpLimiter)

    // Apply request screening (but skip for OAuth2 routes)
    app.use((req, res, next) => {
        // Skip request screening for OAuth2 redirect and swagger docs
        if (
            req.path.includes('/oauth2-redirect.html') ||
            req.path.includes('/api-docs') ||
            req.path.includes('/swagger')
        ) {
            return next()
        }
        return requestScreening(req, res, next)
    })

    // Data sanitization (skip for OAuth2 redirects)
    app.use((req, res, next) => {
        if (req.path.includes('/oauth2-redirect.html')) {
            return next()
        }
        return sanitizeData(req, res, next)
    })

    app.use((req, res, next) => {
        if (req.path.includes('/oauth2-redirect.html')) {
            return next()
        }
        return preventXSS(req, res, next)
    })

    app.use(preventParameterPollution)
    app.use(verifyContentType)

    // Disable caching for API responses (but allow caching for static assets)
    app.use('/api', (req: Request, res: Response, next: NextFunction) => {
        // Allow caching for swagger assets
        if (req.path.includes('/api-docs') && !req.path.includes('/swagger.json')) {
            return next()
        }
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
        res.set('Pragma', 'no-cache')
        res.set('Expires', '0')
        next()
    })

    logger.info('✅ Security middleware initialized')
}
