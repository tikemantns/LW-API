import * as winston from 'winston'

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
}

winston.addColors(colors)

// Custom filter to exclude API documentation routes and other noise
const filterFormat = winston.format((info) => {
    // Filter out API documentation requests and other unwanted logs
    if (info.message && typeof info.message === 'string') {
        const message = info.message.toLowerCase()
        
        // Skip swagger/api docs related logs
        if (message.includes('api-docs') || 
            message.includes('swagger') ||
            message.includes('.js') ||
            message.includes('.css') ||
            message.includes('.png') ||
            message.includes('.ico') ||
            message.includes('favicon')) {
            return false
        }
        
        // Skip health check logs
        if (message.includes('healthcheck') || 
            message.includes('/health')) {
            return false
        }
    }
    
    return info
})

// Production format (no colors, structured JSON)
const productionFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    filterFormat(),
    winston.format.json()
)

// Development format (with colors)
const developmentFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    filterFormat(),
    winston.format.colorize({ all: true }),
    winston.format.printf((info) => `${info.message}`)
)

// Choose format based on environment - disable colors in production/nonprod
const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'nonprod'
const logFormat = isProduction ? productionFormat : developmentFormat

const logger = winston.createLogger({
    format: logFormat,
    transports: [
        new winston.transports.Console(),
    ],
})

export default logger
