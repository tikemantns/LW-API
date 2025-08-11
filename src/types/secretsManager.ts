/**
 * Types for AWS Secrets Manager integration
 * Contains interfaces for database and Redis credentials
 */

export interface DatabaseCredentials {
    username?: string
    password?: string
    engine?: string
    host?: string
    port?: number
    ssl?: boolean
    dbClusterIdentifier?: string
    database?: string
    authSource?: string
}

export interface RedisCredentials {
    host?: string
    port?: number
    password?: string
    db?: number
    cluster?: {
        nodes?: Array<{ host: string; port: number }>
        password?: string
    }
    tls?: boolean
}

export interface SecretsCredentials {
    redis?: RedisCredentials
}
