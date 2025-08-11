/**
 * Types for Redis configuration (environment variables fallback)
 */

export interface RedisEnvConfig {
    host: string
    port: number
    password?: string
    db?: number
    connectTimeout?: number
    commandTimeout?: number
    retryDelayOnFailover?: number
    maxRetriesPerRequest?: number
    lazyConnect?: boolean
    keepAlive?: number
}

export interface RedisClusterEnvConfig {
    nodes: Array<{ host: string; port: number }>
    redisOptions?: {
        password?: string
        connectTimeout?: number
        commandTimeout?: number
        lazyConnect?: boolean
        keepAlive?: number
    }
}
