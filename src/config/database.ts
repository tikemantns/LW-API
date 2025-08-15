/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose'
import logger from '../utils/logger'
import { DatabaseCredentials } from '../types/secretsManager'

const databaseCredentials: DatabaseCredentials | null = null

const connectionOptions = {
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '20', 10),
    minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5', 10),
    socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10),
    connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '10000', 10),
    serverSelectionTimeoutMS: parseInt(
        process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '15000',
        10
    ),
    heartbeatFrequencyMS: parseInt(process.env.MONGODB_HEARTBEAT_FREQUENCY_MS || '10000', 10),
    maxIdleTimeMS: parseInt(process.env.MONGODB_MAX_IDLE_TIME_MS || '300000', 10), // 5 minutes
    retryWrites: false,
    retryReads: true,
    autoIndex: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'prod' && process.env.NODE_ENV !== 'nonprod', // Disable autoIndex in production
    ssl: true,
    tlsAllowInvalidCertificates: false,
    bufferCommands: false, // Disable mongoose buffering
}

const getMongoDBUri = async (): Promise<string> => {

    const mongoUri = buildMongoDBUri() || process.env.MONGODB_URI || ''
    logger.info('Using MongoDB URI from environment variables for NonProd/Production')
    return mongoUri
}

export const buildMongoDBUri = (): string => {
    // const host = credentials.host || 'localhost'
    // const port = credentials.port || 27017
    // const username = credentials.username
    // const password = credentials.password
    // const database = credentials.database

    return 'mongodb+srv://localWork:localwork@lw-cluster.ckoak9d.mongodb.net/localworkDB?retryWrites=true&w=majority&appName=LW-Cluster' //'mongodb://localhost:27017/localworkDB' 
}

export const connectDatabase = async () => {
    try {
        const mongoUri = await getMongoDBUri()
        
        // Only enable debug logging in development
        if (process.env.NODE_ENV === 'development') {
            mongoose.set('debug', true)
        }
        
        await mongoose.connect(mongoUri, connectionOptions)

        logger.info('MongoDB connected successfully')
        logger.info(`Database: ${mongoose.connection.name}`)
        
        // Only log connection pool info in development
        if (process.env.NODE_ENV === 'development') {
            logger.info(
                `Connection Pool Configuration - Max Size: ${connectionOptions.maxPoolSize}, Min Size: ${connectionOptions.minPoolSize}`
            )
        }

        // Only log critical errors, not reconnections
        mongoose.connection.on('error', (err: Error) => {
            logger.error('MongoDB error:', err)
        })
        
    } catch (error) {
        logger.error('MongoDB connection error:', error)
        // In development, don't exit if database fails
        if (process.env.NODE_ENV === 'development') {
            logger.warn('Continuing without database in development mode')
            return
        }
        process.exit(1)
    }
}

// Only monitor critical connection issues, not normal reconnections
mongoose.connection.on('error', (error) => {
    logger.error('MongoDB error:', error)
})

// Monitor connection pool only in development
mongoose.connection.on('connected', () => {
    // Periodically log connection status in development only
    if (process.env.NODE_ENV === 'development') {
        setInterval(() => {
            const readyState =
                ['disconnected', 'connected', 'connecting', 'disconnecting'][
                    mongoose.connection.readyState
                ] || 'unknown'
            logger.debug(`MongoDB Connection Status: ${readyState}`)
        }, 60000) // Log every minute
    }
})

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close()
        logger.info('MongoDB connection closed through app termination')
        process.exit(0)
    } catch (error) {
        logger.error('Error closing MongoDB connection:', error)
        process.exit(1)
    }
})
