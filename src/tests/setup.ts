import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

// Ensure we're in test environment
process.env.NODE_ENV = 'test'

let mongoServer: MongoMemoryServer

beforeAll(async () => {
    // Disconnect from any existing connection first
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
    }

    mongoServer = await MongoMemoryServer.create()
    const mongoUri = mongoServer.getUri()
    await mongoose.connect(mongoUri)
})

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await mongoServer.stop()
})

beforeEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
        await collections[key].deleteMany({})
    }
})
