import { Request, Response, NextFunction } from 'express'
import { performance } from 'perf_hooks'
import logger from '../utils/logger'
import { RequestMetric } from '../types'

// Keep a rolling window of recent requests
const recentRequests: RequestMetric[] = []
const MAX_METRICS_HISTORY = 1000

/**
 * Keep only the most recent metrics to avoid memory issues
 */
const pruneMetricsHistory = () => {
    if (recentRequests.length > MAX_METRICS_HISTORY) {
        recentRequests.splice(0, recentRequests.length - MAX_METRICS_HISTORY)
    }
}

/**
 * Calculate performance statistics for a given route
 */
const calculateRouteStats = (route: string) => {
    const routeMetrics = recentRequests.filter((r) => r.path === route)

    if (routeMetrics.length === 0) {
        return null
    }

    // Calculate response time statistics
    const responseTimes = routeMetrics.map((r) => r.responseTime)
    const avgResponseTime =
        responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    const maxResponseTime = Math.max(...responseTimes)
    const minResponseTime = Math.min(...responseTimes)

    // Sort response times to calculate percentiles
    const sortedTimes = [...responseTimes].sort((a, b) => a - b)
    const p95Index = Math.floor(sortedTimes.length * 0.95)
    const p99Index = Math.floor(sortedTimes.length * 0.99)

    return {
        route,
        requestCount: routeMetrics.length,
        avgResponseTime: avgResponseTime.toFixed(2),
        p95ResponseTime: sortedTimes[p95Index],
        p99ResponseTime: sortedTimes[p99Index],
        maxResponseTime,
        minResponseTime,
        errorRate: routeMetrics.filter((r) => r.statusCode >= 400).length / routeMetrics.length,
    }
}

/**
 * Middleware to measure API response times and collect performance metrics
 */
export const performanceMetricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Skip tracking for certain paths like health checks
    if (req.path === '/health') {
        return next()
    }

    // Mark start time
    const startTime = performance.now()

    // Track original end method to capture metrics before response is sent
    const originalEnd = res.end

    res.end = function (
        chunk?: any,
        encoding?: BufferEncoding | (() => void),
        cb?: () => void
    ): Response {
        // Calculate response time
        const responseTime = performance.now() - startTime

        // Normalize the path by removing specific IDs for better aggregation
        const normalizedPath = req.route ? req.route.path : req.path

        // Store metrics
        const metric: RequestMetric = {
            path: normalizedPath,
            method: req.method,
            statusCode: res.statusCode,
            responseTime,
            timestamp: Date.now(),
        }

        recentRequests.push(metric)
        pruneMetricsHistory()

        // Log slow requests for investigation
        if (responseTime > 1000) {
            // Over 1 second is considered slow
            logger.warn(
                `Slow API response: ${req.method} ${normalizedPath} took ${responseTime.toFixed(2)}ms`
            )
        }

        // Add timing header if not in production and headers haven't been sent
        if (process.env.NODE_ENV !== 'production' && !res.headersSent) {
            try {
                res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`)
            } catch (error) {
                // Headers already sent, ignore
            }
        }

        // Call original end method
        return originalEnd.call(this, chunk, encoding as BufferEncoding, cb)
    }

    next()
}

/**
 * Get current performance statistics
 */
export const getPerformanceStats = () => {
    // Get unique routes
    const uniqueRoutes = [...new Set(recentRequests.map((r) => r.path))]

    // Calculate stats for each route
    const routeStats = uniqueRoutes.map(calculateRouteStats).filter(Boolean)

    // Calculate overall stats
    const totalRequests = recentRequests.length
    const avgOverallResponseTime =
        recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests
    const errorCount = recentRequests.filter((r) => r.statusCode >= 400).length

    return {
        timestamp: new Date().toISOString(),
        totalRequests,
        avgResponseTime: avgOverallResponseTime.toFixed(2),
        errorRate: (errorCount / totalRequests).toFixed(4),
        routeStats,
    }
}

/**
 * Endpoint to expose performance metrics for monitoring
 * (Only available in non-production environments unless authorized)
 */
export const performanceMetricsHandler = (req: Request, res: Response) => {
    // In production, require authorization
    if (process.env.NODE_ENV === 'production') {
        const apiKey = req.header('X-API-Key')
        if (apiKey !== process.env.METRICS_API_KEY) {
            return res.status(403).json({ error: 'Unauthorized access to metrics' })
        }
    }

    const stats = getPerformanceStats()
    res.json(stats)
}
