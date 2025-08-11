/**
 * Types for performance monitoring middleware
 */

export interface RequestMetric {
    path: string
    method: string
    statusCode: number
    responseTime: number
    timestamp: number
}
