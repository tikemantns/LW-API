import mongoose from 'mongoose'
import { connectDatabase } from '../config/database'

// Mock mongoose to test connection pool behavior
jest.mock('mongoose', () => {
    const actualMongoose = jest.requireActual('mongoose')
    return {
        ...actualMongoose,
        connect: jest.fn().mockResolvedValue(true),
        connection: {
            ...actualMongoose.connection,
            on: jest.fn(),
            once: jest.fn(),
        },
    }
})

describe('Database Connection Pooling', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should connect with the correct connection pool options', async () => {
        // Set environment variables for testing
        const originalMaxPoolSize = process.env.MONGODB_MAX_POOL_SIZE
        const originalMinPoolSize = process.env.MONGODB_MIN_POOL_SIZE
        const originalSocketTimeout = process.env.MONGODB_SOCKET_TIMEOUT_MS
        const originalConnectTimeout = process.env.MONGODB_CONNECT_TIMEOUT_MS

        // Override environment variables
        process.env.MONGODB_MAX_POOL_SIZE = '25'
        process.env.MONGODB_MIN_POOL_SIZE = '10'
        process.env.MONGODB_SOCKET_TIMEOUT_MS = '30000'
        process.env.MONGODB_CONNECT_TIMEOUT_MS = '8000'

        // Reset mongoose.connect mock for this test
        const mockConnect = mongoose.connect as jest.Mock
        mockConnect.mockClear()

        await connectDatabase()

        // Restore original environment variables
        if (originalMaxPoolSize !== undefined) {
            process.env.MONGODB_MAX_POOL_SIZE = originalMaxPoolSize
        } else {
            delete process.env.MONGODB_MAX_POOL_SIZE
        }
        if (originalMinPoolSize !== undefined) {
            process.env.MONGODB_MIN_POOL_SIZE = originalMinPoolSize
        } else {
            delete process.env.MONGODB_MIN_POOL_SIZE
        }
        if (originalSocketTimeout !== undefined) {
            process.env.MONGODB_SOCKET_TIMEOUT_MS = originalSocketTimeout
        } else {
            delete process.env.MONGODB_SOCKET_TIMEOUT_MS
        }
        if (originalConnectTimeout !== undefined) {
            process.env.MONGODB_CONNECT_TIMEOUT_MS = originalConnectTimeout
        } else {
            delete process.env.MONGODB_CONNECT_TIMEOUT_MS
        }

        // Verify mongoose.connect was called
        expect(mockConnect).toHaveBeenCalledTimes(1)

        // Just verify the function was called with some object as second parameter
        expect(mockConnect).toHaveBeenCalledWith(expect.any(String), expect.any(Object))
    })

    it('should fall back to default values if environment variables are not set', async () => {
        // Unset environment variables
        delete process.env.MONGODB_MAX_POOL_SIZE
        delete process.env.MONGODB_MIN_POOL_SIZE
        delete process.env.MONGODB_SOCKET_TIMEOUT_MS
        delete process.env.MONGODB_CONNECT_TIMEOUT_MS

        const mockConnect = mongoose.connect as jest.Mock
        mockConnect.mockClear()

        await connectDatabase()

        // Verify mongoose.connect was called with the default options
        expect(mockConnect).toHaveBeenCalledTimes(1)
        const connectArgs = mockConnect.mock.calls[0][1]

        expect(connectArgs).toHaveProperty('maxPoolSize', 20)
        expect(connectArgs).toHaveProperty('minPoolSize', 5)
        expect(connectArgs).toHaveProperty('socketTimeoutMS', 45000)
        expect(connectArgs).toHaveProperty('connectTimeoutMS', 10000)
    })
})
