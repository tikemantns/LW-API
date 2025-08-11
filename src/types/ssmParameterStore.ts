/**
 * Types for AWS Systems Manager Parameter Store integration
 * Contains interfaces for application configuration stored in SSM
 */

export interface SSMConfigResponse {
    application?: {
        port?: number
        nodeEnv?: string
        logLevel?: string
        corsOrigins?: string[]
        rateLimitWindowMs?: number
        rateLimitMax?: number
    }
    auth?: {
        jwtExpiration?: string
        refreshTokenExpiration?: string
        tokenAlgorithm?: string
        enforceRequestSigning?: boolean
    }
    cache?: {
        ttl?: number
        enabled?: boolean
        prefix?: string
    }
    performance?: {
        metricsEnabled?: boolean
        alertThresholdMs?: number
        slowQueryThresholdMs?: number
    }
    swagger?: {
        enabled?: boolean
        clientId?: string
        tenantId?: string
    }
    monitoring?: {
        healthCheckEnabled?: boolean
        performanceTracking?: boolean
        logLevel?: string
    }
    features?: {
        [key: string]: boolean
    }
    [key: string]: unknown
}
