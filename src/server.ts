import dotenv from 'dotenv'
import app from './app'
import logger from './utils/logger'
import { connectDatabase } from './config/database'
import { initializeRedis, disconnectRedis, setSSMConfiguration } from './config/redis'

dotenv.config()

const PORT = parseInt(process.env.PORT || '3000', 10)
const environment = process.env.NODE_ENV || 'development'
const isProduction = environment === 'nonprod' || environment === 'production' || environment === 'local'

const initializeDatabase = async (): Promise<void> => {
    try {
        await connectDatabase()
    } catch (error) {
        logger.error('Database connection failed:', error)
        // In development, continue without database if connection fails
        if (environment === 'development') {
            logger.warn('Continuing without database in development mode')
            return
        }
        throw error
    }
}

const initializeCache = async (): Promise<void> => {
    try {
        await initializeRedis()
    } catch (error) {
        logger.warn('Redis unavailable, continuing without cache')
    }
}



const initializeServices = async (): Promise<void> => {
    try {
        logger.info(`🚀 Initializing services [${environment}]...`)

        await initializeDatabase()
        // await initializeCache()

        logger.info('✅ Services initialized successfully')
    } catch (error) {
        logger.error('Service initialization failed:', error)
        throw error
    }
}

const startApplication = async (): Promise<import('http').Server> => {
    try {
        await initializeServices()

        const HOST = '0.0.0.0' // Bind to all interfaces for Android emulator access
        const appServer = app.listen(PORT, HOST, () => {
            logger.info(`🚀 Server running on ${HOST}:${PORT}`)
            logger.info(`📚 Docs: ${process.env.SERVER_URL}/api/v1/product-spec/api-docs`)
            logger.info(`🏥 Health: ${process.env.SERVER_URL}/healthcheck`)
        })

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
        process.on('SIGINT', () => gracefulShutdown('SIGINT'))

        return appServer
    } catch (error) {
        logger.error('Application startup failed:', error)
        process.exit(1)
    }
}

const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down...`)

    try {
        await disconnectRedis()

        if (server) {
            server.close(() => {
                logger.info('Server closed')
                process.exit(0)
            })
        } else {
            process.exit(0)
        }
    } catch (error) {
        logger.error('Shutdown error:', error)
        process.exit(1)
    }
}

// Export server for testing
export let server: import('http').Server

// Start the application
startApplication()
    .then((appServer) => {
        server = appServer
    })
    .catch((error) => {
        logger.error('Failed to start application:', error)
        process.exit(1)
    })
