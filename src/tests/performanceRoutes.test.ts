import request from 'supertest'
import app from '../app'

describe('Performance Routes Authentication Tests', () => {
    beforeEach(() => {
        // Set environment to skip token verification for tests
        process.env.SKIP_TOKEN_VERIFICATION = 'true'
        process.env.NODE_ENV = 'test'
    })

    describe('Performance Routes with Admin Access', () => {
        it('should allow admin access to database performance stats', async () => {
            const response = await request(app)
                .get('/api/v1/product-spec/performance/database')
                .set('Authorization', 'Bearer admin-token')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toBeDefined()
            expect(response.body.data.timestamp).toBeDefined()
        })

        it('should allow admin access to cache stats', async () => {
            const response = await request(app)
                .get('/api/v1/product-spec/performance/cache/stats')
                .set('Authorization', 'Bearer admin-token')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toBeDefined()
        })

        it('should allow admin to reset performance stats', async () => {
            const response = await request(app)
                .post('/api/v1/product-spec/performance/database/reset')
                .set('Authorization', 'Bearer admin-token')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.message).toContain('reset successfully')
        })

        it('should allow admin to clear cache', async () => {
            const response = await request(app)
                .post('/api/v1/product-spec/performance/cache/clear')
                .set('Authorization', 'Bearer admin-token')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.message).toContain('cleared successfully')
        })
    })

    describe('Performance Routes Access Control', () => {
        it('should reject unauthenticated requests', async () => {
            const response = await request(app)
                .get('/api/v1/product-spec/performance/database')
                .expect(401)

            expect(response.body.success).toBe(false)
            expect(response.body.error).toContain('Access denied')
        })

        it('should allow users with read permissions to access database stats', async () => {
            const response = await request(app)
                .get('/api/v1/product-spec/performance/database')
                .set('Authorization', 'Bearer external-user-token')
                .expect(200)

            expect(response.body.success).toBe(true)
            expect(response.body.data).toBeDefined()
        })

        it('should reject non-admin users from write operations', async () => {
            const response = await request(app)
                .post('/api/v1/product-spec/performance/cache/clear')
                .set('Authorization', 'Bearer external-user-token')
                .expect(403)

            expect(response.body.success).toBe(false)
            expect(response.body.error).toContain('Required scope')
        })
    })
})
