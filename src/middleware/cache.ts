import { Request, Response, NextFunction } from 'express'
import NodeCache from 'node-cache'
import { createHash } from 'crypto'
import logger from '../utils/logger'

const apiCache = new NodeCache({
    stdTTL: parseInt(process.env.CACHE_TTL_DEFAULT || '300', 10), // Default TTL from env or 5 minutes
    checkperiod: 60, // Check for expired keys every 60 seconds
    useClones: false, // For better performance, disable cloning
    maxKeys: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10), // Limit cache size to prevent memory issues
})

const generateCacheKey = (req: Request): string => {
    // For GET requests, use the full URL as the key
    if (req.method === 'GET') {
        const sortedQuery = Object.keys(req.query)
            .sort()
            .reduce((acc: Record<string, any>, key) => {
                acc[key] = req.query[key]
                return acc
            }, {})

        const keySource = `${req.originalUrl}:${JSON.stringify(sortedQuery)}`
        return createHash('md5').update(keySource).digest('hex')
    }

    // For non-GET requests, use a combination of method, URL and body hash
    const bodyHash = req.body
        ? createHash('md5').update(JSON.stringify(req.body)).digest('hex')
        : ''
    return `${req.method}:${req.originalUrl}:${bodyHash}`
}

const isCacheable = (req: Request): boolean => {
    // Only cache GET requests by default
    if (req.method !== 'GET') return false

    // Don't cache if cache control headers indicate no cache
    const cacheControl = req.headers['cache-control'] || ''
    if (cacheControl.includes('no-cache') || cacheControl.includes('no-store')) {
        return false
    }

    // Don't cache authenticated requests unless explicitly allowed
    if (req.headers.authorization && process.env.CACHE_AUTH_REQUESTS !== 'true') {
        return false
    }

    return true
}

const getCacheTTL = (req: Request): number => {
    // Get default cache duration from environment or use 300 seconds (5 minutes)
    const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_DEFAULT || '300', 10)
    const PUBLIC_TTL = parseInt(process.env.CACHE_TTL_PUBLIC || '1800', 10)

    // Route-specific TTL settings
    const pathPatterns: Record<string, number> = {
        '/api/v1/product-specs': DEFAULT_TTL, // Default for product specs list
        '/api/v1/product-specs/count': DEFAULT_TTL * 2, // Double for count endpoint
        '/api/v1/public': PUBLIC_TTL, // Longer for public endpoints
        '/health': 60, // 1 minute for health checks
    }

    // Find matching route pattern
    const matchedPattern = Object.keys(pathPatterns).find((pattern) => req.path.startsWith(pattern))

    return matchedPattern ? pathPatterns[matchedPattern] : DEFAULT_TTL
}

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Skip caching for non-cacheable requests
    if (!isCacheable(req)) {
        return next()
    }

    const cacheKey = generateCacheKey(req)
    const cachedResponse = apiCache.get(cacheKey)

    // Cache hit
    if (cachedResponse) {
        logger.debug(`Cache hit for: ${req.method} ${req.originalUrl}`)

        // Add cache header to indicate it's from cache - only if headers not sent
        if (!res.headersSent) {
            res.set('X-Cache', 'HIT')
            res.set('X-Response-Source', 'cache')
            res.status(200).json(cachedResponse)
        }
        return
    }

    // Cache miss - store the response before sending
    if (!res.headersSent) {
        res.set('X-Cache', 'MISS')
    }

    // Capture the original res.json method
    const originalJson = res.json
    res.json = function (body: any): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
            // Calculate TTL based on route
            const ttl = getCacheTTL(req)

            // Store in cache
            apiCache.set(cacheKey, body, ttl)
            logger.debug(`Cached: ${req.method} ${req.originalUrl} for ${ttl}s`)
        }

        // Call the original json method if headers haven't been sent
        if (!res.headersSent) {
            return originalJson.call(this, body)
        }
        return this
    }

    next()
}

export const clearCache = (pattern?: string): number => {
    if (!pattern) {
        // Clear entire cache
        const keysCount = apiCache.keys().length
        apiCache.flushAll()
        return keysCount
    }

    // Clear by pattern
    const matchingKeys = apiCache.keys().filter((key) => key.includes(pattern))
    matchingKeys.forEach((key) => apiCache.del(key))

    return matchingKeys.length
}

export const getCacheStats = () => {
    return {
        keys: apiCache.keys().length,
        hits: apiCache.getStats().hits,
        misses: apiCache.getStats().misses,
        ksize: apiCache.getStats().ksize,
        vsize: apiCache.getStats().vsize,
    }
}

// Periodically log cache statistics
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        const stats = getCacheStats()
        logger.debug(
            `Cache stats - Keys: ${stats.keys}, Hits: ${stats.hits}, Misses: ${stats.misses}`
        )
    }, 60000) // Every minute
}
