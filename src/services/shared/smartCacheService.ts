import NodeCache from 'node-cache'
import { cacheService as redisCache } from './cacheService'
import { isRedisEnabled } from '../../config/redis'
import logger from '../../utils/logger'

/**
 * Smart Cache Strategy
 * - Development: In-memory cache (node-cache)
 * - NonProd/Production: Redis cache (AWS ElastiCache)
 */

class SmartCacheService {
    private memoryCache: NodeCache
    private useRedis: boolean

    constructor() {
        // Initialize in-memory cache
        this.memoryCache = new NodeCache({
            stdTTL: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutes default
            checkperiod: 60,
            useClones: false,
            maxKeys: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
        })

        // Determine cache strategy based on environment
        this.useRedis = this.shouldUseRedis()

        const env = process.env.NODE_ENV || 'development'
        const cacheType = this.useRedis ? 'Redis (NonProd/Production)' : 'In-Memory (Development)'
        logger.info(`🔄 Cache strategy: ${cacheType} [Environment: ${env}]`)
    }

    private shouldUseRedis(): boolean {
        const env = process.env.NODE_ENV?.toLowerCase()

        if (env === 'nonprod' || env === 'production') {
            const redisEnabled = isRedisEnabled()
            if (!redisEnabled)
                logger.warn(
                    `🔄 Environment is ${env} but Redis is not enabled. Falling back to in-memory cache.`
                )
            return redisEnabled
        }

        logger.info(`🔄 Environment is ${env || 'development'}, using in-memory cache as intended.`)
        return false
    }

    /**
     * Set a value in cache
     */
    async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
        try {
            if (this.useRedis) {
                return await redisCache.set(key, value, ttlSeconds)
            } else {
                const ttl = ttlSeconds || parseInt(process.env.CACHE_TTL || '300', 10)
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
                return this.memoryCache.set(key, stringValue, ttl)
            }
        } catch (error) {
            logger.warn(`Smart cache set failed for key ${key}:`, error)
            return false
        }
    }

    /**
     * Get a value from cache
     */
    async get<T = unknown>(key: string): Promise<T | null> {
        try {
            if (this.useRedis) {
                return await redisCache.get<T>(key)
            } else {
                const value = this.memoryCache.get<string>(key)
                if (value === undefined) {
                    return null
                }

                try {
                    return JSON.parse(value) as T
                } catch {
                    return value as T
                }
            }
        } catch (error) {
            logger.warn(`Smart cache get failed for key ${key}:`, error)
            return null
        }
    }

    /**
     * Delete a value from cache
     */
    async delete(key: string): Promise<boolean> {
        try {
            if (this.useRedis) {
                return await redisCache.delete(key)
            } else {
                return this.memoryCache.del(key) > 0
            }
        } catch (error) {
            logger.warn(`Smart cache delete failed for key ${key}:`, error)
            return false
        }
    }

    /**
     * Check if a key exists in cache
     */
    async exists(key: string): Promise<boolean> {
        try {
            if (this.useRedis) {
                return await redisCache.exists(key)
            } else {
                return this.memoryCache.has(key)
            }
        } catch (error) {
            logger.warn(`Smart cache exists check failed for key ${key}:`, error)
            return false
        }
    }

    /**
     * Clear cache by pattern
     */
    async clearPattern(pattern: string): Promise<number> {
        try {
            if (this.useRedis) {
                return await redisCache.clearPattern(pattern)
            } else {
                // For in-memory cache, clear all keys matching the pattern
                const keys = this.memoryCache.keys()
                let deletedCount = 0

                const regex = new RegExp(pattern.replace(/\*/g, '.*'))
                for (const key of keys) {
                    if (regex.test(key)) {
                        if (this.memoryCache.del(key) > 0) {
                            deletedCount++
                        }
                    }
                }

                return deletedCount
            }
        } catch (error) {
            logger.warn(`Smart cache pattern clear failed for pattern ${pattern}:`, error)
            return 0
        }
    }

    /**
     * Clear all cache entries
     */
    async clearAll(): Promise<number> {
        try {
            if (this.useRedis) {
                return await redisCache.clearPattern('*')
            } else {
                const keyCount = this.memoryCache.keys().length
                this.memoryCache.flushAll()
                return keyCount
            }
        } catch (error) {
            logger.warn('Smart cache clear all failed:', error)
            return 0
        }
    }

    /**
     * Get cache statistics
     */
    async getStats(): Promise<{
        type: 'redis' | 'memory'
        enabled: boolean
        environment: string
        stats: unknown
    }> {
        const env = process.env.NODE_ENV || 'development'

        if (this.useRedis) {
            return {
                type: 'redis',
                enabled: true,
                environment: env,
                stats: {
                    connected: isRedisEnabled(),
                    provider: 'AWS ElastiCache',
                },
            }
        } else {
            const memStats = this.memoryCache.getStats()
            return {
                type: 'memory',
                enabled: true,
                environment: env,
                stats: {
                    ...memStats,
                    hitRate:
                        memStats.hits > 0
                            ? (memStats.hits / (memStats.hits + memStats.misses)) * 100
                            : 0,
                    provider: 'node-cache',
                },
            }
        }
    }

    /**
     * Cache with automatic retrieval if miss
     */
    async getOrSet<T = unknown>(
        key: string,
        fetchFunction: () => Promise<T>,
        ttlSeconds?: number
    ): Promise<T | null> {
        try {
            // Try to get from cache first
            const cached = await this.get<T>(key)
            if (cached !== null) {
                return cached
            }

            // Cache miss, fetch the data
            const data = await fetchFunction()

            if (data !== null && data !== undefined) {
                // Store in cache (fire and forget)
                this.set(key, data, ttlSeconds).catch(() => {
                    // Silently ignore cache storage failures
                })
            }

            return data
        } catch (error) {
            logger.error(`Smart cache getOrSet failed for key ${key}:`, error)

            // If caching fails, still try to fetch the data
            try {
                return await fetchFunction()
            } catch (fetchError) {
                logger.error(`Fetch function failed for key ${key}:`, fetchError)
                return null
            }
        }
    }

    /**
     * Generate cache keys for common patterns
     */
    keys = {
        productSpec: (id: string) => `product-spec:${id}`,
        productSpecList: (query: string) => `product-spec-list:${query}`,
        productSpecCount: (query: string) => `product-spec-count:${query}`,
        healthCheck: () => 'health-check',
        userSession: (userId: string) => `user-session:${userId}`,
        searchResults: (searchQuery: string) =>
            `search:${Buffer.from(searchQuery).toString('base64')}`,
    }

    /**
     * Get current cache type
     */
    getCacheType(): 'redis' | 'memory' {
        return this.useRedis ? 'redis' : 'memory'
    }

    /**
     * Check if Redis is being used
     */
    isUsingRedis(): boolean {
        return this.useRedis
    }
}

// Export singleton instance
export const smartCache = new SmartCacheService()

// Export for testing and advanced usage
export default smartCache
