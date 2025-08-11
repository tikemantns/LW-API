import {
    getRedisClient,
    setRedisValue,
    getRedisValue,
    deleteRedisValue,
    hasRedisKey,
    isRedisEnabled,
} from '../../config/redis'
import logger from '../../utils/logger'

export class CacheService {
    private prefix = 'ps:' // product-spec cache prefix
    private defaultTTL = 300 // 5 minutes default TTL

    private getCacheKey(key: string): string {
        return `${this.prefix}${key}`
    }

    async set(key: string, value: unknown, ttlSeconds?: number): Promise<boolean> {
        try {
            if (!isRedisEnabled()) {
                return false
            }

            const cacheKey = this.getCacheKey(key)
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
            const ttl = ttlSeconds || this.defaultTTL

            const result = await setRedisValue(cacheKey, stringValue, ttl)
            return result
        } catch (error) {
            logger.warn(`Cache set failed for key ${key}:`, error)
            return false
        }
    }

    async get<T = unknown>(key: string): Promise<T | null> {
        try {
            if (!isRedisEnabled()) {
                return null
            }

            const cacheKey = this.getCacheKey(key)
            const value = await getRedisValue(cacheKey)

            if (value === null) {
                return null
            }

            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(value) as T
            } catch {
                return value as T
            }
        } catch (error) {
            logger.warn(`Cache get failed for key ${key}:`, error)
            return null
        }
    }

    async delete(key: string): Promise<boolean> {
        try {
            if (!isRedisEnabled()) {
                return false
            }

            const cacheKey = this.getCacheKey(key)
            const result = await deleteRedisValue(cacheKey)
            return result
        } catch (error) {
            logger.warn(`Cache delete failed for key ${key}:`, error)
            return false
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            if (!isRedisEnabled()) {
                return false
            }

            const cacheKey = this.getCacheKey(key)
            return await hasRedisKey(cacheKey)
        } catch (error) {
            logger.warn(`Cache exists check failed for key ${key}:`, error)
            return false
        }
    }

    async clearPattern(pattern: string): Promise<number> {
        try {
            if (!isRedisEnabled()) {
                return 0
            }

            const client = getRedisClient()
            if (!client) {
                return 0
            }

            const fullPattern = this.getCacheKey(pattern)

            // Use SCAN instead of KEYS for better performance and permission compatibility
            let cursor = '0'
            let deletedCount = 0

            do {
                try {
                    const result = await client.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100)
                    cursor = result[0]
                    const keys = result[1]

                    if (keys.length > 0) {
                        for (const key of keys) {
                            const deleted = await deleteRedisValue(key.replace(this.prefix, ''))
                            if (deleted) {
                                deletedCount++
                            }
                        }
                    }
                } catch (scanError) {
                    break
                }
            } while (cursor !== '0')

            return deletedCount
        } catch (error) {
            logger.warn(`Cache pattern clear failed for pattern ${pattern}:`, error)
            return 0
        }
    }

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
            logger.error(`Cache getOrSet failed for key ${key}:`, error)

            // If caching fails, still try to fetch the data
            try {
                return await fetchFunction()
            } catch (fetchError) {
                logger.error(`Fetch function failed for key ${key}:`, fetchError)
                return null
            }
        }
    }

    keys = {
        productSpec: (id: string) => `product-spec:${id}`,
        productSpecList: (query: string) => `product-spec-list:${query}`,
        productSpecCount: (query: string) => `product-spec-count:${query}`,
        healthCheck: () => 'health-check',
        userSession: (userId: string) => `user-session:${userId}`,
        searchResults: (searchQuery: string) =>
            `search:${Buffer.from(searchQuery).toString('base64')}`,
    }
}

// Export singleton instance
export const cacheService = new CacheService()

// Export for testing and advanced usage
export default cacheService
