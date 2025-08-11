import { performance } from 'perf_hooks'
import logger from './logger'

interface OperationMetric {
    operation: string
    duration: number
    timestamp: Date
    context?: any
}

// Store recent operation metrics (rolling window)
const operationMetrics: OperationMetric[] = []
const MAX_METRICS_HISTORY = 1000

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
    QUERY: 200, // GET operations
    CREATE: 150, // POST operations
    UPDATE: 150, // PUT/PATCH operations
    DELETE: 100, // DELETE operations
    BATCH: 500, // Batch operations
}

/**
 * Database operation performance tracker
 */
export class DatabasePerformanceTracker {
    private startTime: number
    private operation: string
    private context: any

    constructor(operation: string, context?: any) {
        this.operation = operation
        this.context = context
        this.startTime = performance.now()
    }

    /**
     * End the tracking and log if slow
     */
    end(): number {
        const duration = performance.now() - this.startTime

        // Determine threshold based on operation type
        let threshold = PERFORMANCE_THRESHOLDS.QUERY // default
        if (this.operation.includes('create') || this.operation.includes('insert')) {
            threshold = this.operation.includes('batch')
                ? PERFORMANCE_THRESHOLDS.BATCH
                : PERFORMANCE_THRESHOLDS.CREATE
        } else if (this.operation.includes('update')) {
            threshold = PERFORMANCE_THRESHOLDS.UPDATE
        } else if (this.operation.includes('delete')) {
            threshold = PERFORMANCE_THRESHOLDS.DELETE
        }

        // Record metric
        const metric: OperationMetric = {
            operation: this.operation,
            duration,
            timestamp: new Date(),
            context: this.context,
        }

        // Add to metrics history
        operationMetrics.push(metric)

        // Keep only recent metrics
        if (operationMetrics.length > MAX_METRICS_HISTORY) {
            operationMetrics.shift()
        }

        // Log if slow
        if (duration > threshold) {
            logger.warn(
                `🐌 Slow database operation: ${this.operation} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
                {
                    duration,
                    threshold,
                    context: this.context,
                }
            )
        } else if (duration > threshold * 0.7) {
            // Log warning if approaching threshold
            logger.info(
                `⚡ Database operation approaching threshold: ${this.operation} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
            )
        }

        return duration
    }
}

/**
 * Get performance statistics
 */
export const getPerformanceStats = () => {
    if (operationMetrics.length === 0) {
        return {
            totalOperations: 0,
            averageDuration: 0,
            slowOperations: 0,
            operationBreakdown: {},
        }
    }

    const totalOperations = operationMetrics.length
    const totalDuration = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0)
    const averageDuration = totalDuration / totalOperations

    // Count slow operations
    const slowOperations = operationMetrics.filter((metric) => {
        const threshold = metric.operation.includes('create')
            ? PERFORMANCE_THRESHOLDS.CREATE
            : metric.operation.includes('update')
                ? PERFORMANCE_THRESHOLDS.UPDATE
                : metric.operation.includes('delete')
                    ? PERFORMANCE_THRESHOLDS.DELETE
                    : PERFORMANCE_THRESHOLDS.QUERY
        return metric.duration > threshold
    }).length

    // Breakdown by operation type
    const operationBreakdown: { [key: string]: { count: number; avgDuration: number } } = {}

    operationMetrics.forEach((metric) => {
        if (!operationBreakdown[metric.operation]) {
            operationBreakdown[metric.operation] = { count: 0, avgDuration: 0 }
        }
        operationBreakdown[metric.operation].count++
    })

    // Calculate averages for each operation
    Object.keys(operationBreakdown).forEach((operation) => {
        const operationMetricsForType = operationMetrics.filter((m) => m.operation === operation)
        const avgDuration =
            operationMetricsForType.reduce((sum, m) => sum + m.duration, 0) /
            operationMetricsForType.length
        operationBreakdown[operation].avgDuration = Number(avgDuration.toFixed(2))
    })

    return {
        totalOperations,
        averageDuration: Number(averageDuration.toFixed(2)),
        slowOperations,
        slowOperationPercentage: Number(((slowOperations / totalOperations) * 100).toFixed(2)),
        operationBreakdown,
        recentMetrics: operationMetrics.slice(-10), // Last 10 operations
    }
}

/**
 * Reset performance metrics
 */
export const resetPerformanceStats = () => {
    operationMetrics.length = 0
    logger.info('🔄 Database performance metrics reset')
}

/**
 * Helper function to create a tracker
 */
export const trackDatabaseOperation = (
    operation: string,
    context?: any
): DatabasePerformanceTracker => {
    return new DatabasePerformanceTracker(operation, context)
}
