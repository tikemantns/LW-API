import Redis from 'ioredis'
import logger from '../utils/logger'
import { initializeSecretsManagerCredentials } from './secretsManager'

let redisClient: Redis | null = null

const getRedisConfiguration = async () => {
    const useRedis = process.env.USE_REDIS === 'true'

    if (!useRedis) {
        logger.info('⚠️ Redis is disabled (USE_REDIS=false)')
        return null
    }

    let redisCredentials = null
    try {
        redisCredentials = await initializeSecretsManagerCredentials(
            '/sourcing/sps/redis/credentials'
        )
    } catch (error) {
        logger.warn('Failed to load Redis credentials from Secrets Manager:', error)
    }

    const host = process.env.REDIS_HOST
    const port = parseInt(process.env.REDIS_PORT || '6379', 10)
    const username = process.env.REDIS_USERNAME || redisCredentials?.username
    const password = process.env.REDIS_PASSWORD || redisCredentials?.password
    const db = parseInt(process.env.REDIS_DB || redisCredentials?.db || '0', 10)

    if (!host) {
        logger.warn('⚠️ Redis host not configured in environment variables or Secrets Manager')
        return null
    }

    return {
        host,
        port,
        username,
        password,
        db,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryDelayOnFailover: 100,
        lazyConnect: true,
        keepAlive: 30000,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        tls: host.includes('amazonaws.com') ? {} : undefined,
    }
}

export const initializeRedis = async (): Promise<boolean> => {
    try {
        const config = await getRedisConfiguration()

        if (!config) {
            return false
        }

        logger.info(`🔌 Connecting to Redis at ${config.host}:${config.port}...`)

        redisClient = new Redis(config)

        redisClient.on('connect', () => {
            logger.info('✅ Redis connected')
        })

        redisClient.on('error', (error) => {
            logger.error('❌ Redis error:', error.message)
        })

        redisClient.on('close', () => {
            logger.warn('⚠️ Redis disconnected')
        })

        try {
            await redisClient.info('server')
        } catch (testError) {
            try {
                await redisClient.set('test:connection', 'ok', 'EX', 10)
                await redisClient.get('test:connection')
                await redisClient.del('test:connection')
                logger.info('✅ Redis ready (limited permissions)')
            } catch (opError) {
                logger.warn('⚠️ Redis connected with limited access')
            }
        }

        return true
    } catch (error) {
        logger.error('❌ Failed to initialize Redis:', error)
        return false
    }
}

export const getRedisClient = (): Redis | null => redisClient

export const checkRedisHealth = async (): Promise<boolean> => {
    try {
        if (!redisClient) {
            return false
        }

        try {
            await redisClient.ping()
            return true
        } catch (pingError) {
            try {
                await redisClient.set('health:check', 'ok', 'EX', 10)
                await redisClient.get('health:check')
                await redisClient.del('health:check')
                return true
            } catch (opError) {
                return false
            }
        }
    } catch (error) {
        return false
    }
}

export const disconnectRedis = async (): Promise<void> => {
    try {
        if (redisClient) {
            await redisClient.disconnect()
            redisClient = null
            logger.info('🔄 Redis disconnected')
        }
    } catch (error) {
        logger.error('❌ Error disconnecting Redis:', error)
    }
}

export const isRedisEnabled = (): boolean => redisClient !== null && redisClient.status === 'ready'

export const setRedisValue = async (
    key: string,
    value: string,
    ttlSeconds?: number
): Promise<boolean> => {
    try {
        if (!redisClient) return false

        if (ttlSeconds) {
            await redisClient.setex(key, ttlSeconds, value)
        } else {
            await redisClient.set(key, value)
        }

        return true
    } catch (error) {
        return false
    }
}

export const getRedisValue = async (key: string): Promise<string | null> => {
    try {
        if (!redisClient) return null

        return await redisClient.get(key)
    } catch (error) {
        return null
    }
}

export const deleteRedisValue = async (key: string): Promise<boolean> => {
    try {
        if (!redisClient) return false

        const result = await redisClient.del(key)
        return result > 0
    } catch (error) {
        return false
    }
}

export const hasRedisKey = async (key: string): Promise<boolean> => {
    try {
        if (!redisClient) return false

        const result = await redisClient.exists(key)
        return result === 1
    } catch (error) {
        return false
    }
}

// Legacy compatibility - keep these for existing code
export const setSSMConfiguration = (_config: unknown): void => {
    // Not used in simplified version
}
