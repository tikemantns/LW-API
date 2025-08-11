import express from 'express'
import { verifyToken } from '../middleware/auth'
import { getPerformanceStats, resetPerformanceStats } from '../utils/performanceTracker'
import { clearCache, getCacheStats } from '../middleware/cache'
import { cacheService } from '../services/shared/cacheService'
import { smartCache } from '../services/shared/smartCacheService'
import { isRedisEnabled } from '../config/redis'
import logger from '../utils/logger'

const router = express.Router()

// Apply Azure AD token verification to all performance routes
router.use(verifyToken)

router.get('/database', verifyToken, (req, res) => {
    try {
        const stats = getPerformanceStats()

        res.json({
            success: true,
            data: {
                ...stats,
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            },
        })
    } catch (error) {
        logger.error('Error getting database performance stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get performance statistics',
        })
    }
})

router.post('/database/reset', verifyToken, (req, res) => {
    try {
        resetPerformanceStats()

        res.json({
            success: true,
            message: 'Database performance metrics reset successfully',
        })
    } catch (error) {
        logger.error('Error resetting database performance stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to reset performance statistics',
        })
    }
})

router.post('/cache/clear', verifyToken, async (req, res) => {
    try {
        // Use smart cache to clear the appropriate cache system
        const clearedCount = await smartCache.clearAll()
        const cacheType = smartCache.getCacheType()

        logger.info(
            `Cache cleared successfully using ${cacheType} cache. Cleared ${clearedCount} entries.`
        )

        res.json({
            success: true,
            message: 'Cache cleared successfully',
            data: {
                cacheType,
                clearedEntries: clearedCount,
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        logger.error('Error clearing cache:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to clear cache',
        })
    }
})

router.get('/cache/stats', verifyToken, async (req, res) => {
    try {
        // Get stats from smart cache service
        const stats = await smartCache.getStats()

        res.json({
            success: true,
            data: {
                ...stats,
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        logger.error('Error getting cache stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get cache statistics',
        })
    }
})

// Smart cache management routes
router.get('/cache/strategy', verifyToken, async (req, res) => {
    try {
        const stats = await smartCache.getStats()

        res.json({
            success: true,
            data: {
                currentStrategy: stats.type,
                usingRedis: smartCache.isUsingRedis(),
                redisEnabled: isRedisEnabled(),
                recommendation: {
                    development: 'memory',
                    nonprod: 'redis',
                    production: 'redis',
                },
                ...stats,
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        logger.error('Error getting cache strategy info:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get cache strategy information',
        })
    }
})

router.post(
    '/cache/clear/pattern/:pattern',
    verifyToken,
    async (req, res) => {
        try {
            const pattern = req.params.pattern
            const clearedCount = await smartCache.clearPattern(pattern)
            const cacheType = smartCache.getCacheType()

            res.json({
                success: true,
                message: `Cache cleared successfully for pattern: ${pattern}`,
                data: {
                    cacheType,
                    pattern,
                    clearedEntries: clearedCount,
                    timestamp: new Date().toISOString(),
                },
            })
        } catch (error) {
            logger.error('Error clearing cache by pattern:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to clear cache by pattern',
            })
        }
    }
)

// Separate cache management routes

// Memory cache only
router.post('/cache/memory/clear', verifyToken, (req, res) => {
    try {
        const clearedCount = clearCache()

        res.json({
            success: true,
            message: 'Memory cache cleared successfully',
            data: {
                clearedEntries: clearedCount,
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        logger.error('Error clearing memory cache:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to clear memory cache',
        })
    }
})

router.get('/cache/memory/stats', verifyToken, (req, res) => {
    try {
        const stats = getCacheStats()

        res.json({
            success: true,
            data: {
                ...stats,
                hitRate: stats.hits > 0 ? (stats.hits / (stats.hits + stats.misses)) * 100 : 0,
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        logger.error('Error getting memory cache stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get memory cache statistics',
        })
    }
})

// Redis cache only
router.post('/cache/redis/clear', verifyToken, async (req, res) => {
    try {
        if (!isRedisEnabled()) {
            return res.status(400).json({
                success: false,
                error: 'Redis cache is not enabled',
            })
        }

        const clearedCount = await cacheService.clearPattern('*')

        res.json({
            success: true,
            message: 'Redis cache cleared successfully',
            data: {
                clearedEntries: clearedCount,
                timestamp: new Date().toISOString(),
            },
        })
    } catch (error) {
        logger.error('Error clearing Redis cache:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to clear Redis cache',
        })
    }
})

router.post(
    '/cache/redis/clear/:pattern',
    verifyToken,
    async (req, res) => {
        try {
            if (!isRedisEnabled()) {
                return res.status(400).json({
                    success: false,
                    error: 'Redis cache is not enabled',
                })
            }

            const pattern = req.params.pattern
            const clearedCount = await cacheService.clearPattern(pattern)

            res.json({
                success: true,
                message: `Redis cache cleared successfully for pattern: ${pattern}`,
                data: {
                    pattern,
                    clearedEntries: clearedCount,
                    timestamp: new Date().toISOString(),
                },
            })
        } catch (error) {
            logger.error('Error clearing Redis cache by pattern:', error)
            res.status(500).json({
                success: false,
                error: 'Failed to clear Redis cache by pattern',
            })
        }
    }
)

router.get('/cache/redis/stats', verifyToken, (req, res) => {
    try {
        const stats = {
            enabled: isRedisEnabled(),
            connected: isRedisEnabled(),
            timestamp: new Date().toISOString(),
        }

        res.json({
            success: true,
            data: stats,
        })
    } catch (error) {
        logger.error('Error getting Redis cache stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get Redis cache statistics',
        })
    }
})

export default router
