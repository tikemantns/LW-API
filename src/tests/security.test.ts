import request from 'supertest'
import app from '../app'
import jwt from 'jsonwebtoken'
import { AzureTokenPayload } from '../types'

// Mock JWT for Azure AD authentication in security tests
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
}))

describe('Security Middleware Tests', () => {
    // Helper function to generate valid test tokens
    const generateValidToken = () => {
        const tokenPayload: AzureTokenPayload = {
            aud: 'api://10db8271-f6a1-4d55-a083-f2f76f5be6d7',
            iss: 'https://sts.windows.net/cba8ca03-8b95-448d-b259-98a44d112f7c/',
            oid: 'd974ef5d-1863-4c3e-aba5-eec51a25d944',
            sub: 'test-subject',
            name: 'Test User',
            given_name: 'Test',
            family_name: 'User',
            unique_name: 'test.user@anko.com',
            upn: 'test.user@anko.com',
            scp: 'ProductSpecs.Read ProductSpecs.Write ProductSpecs.Admin',
            appid: 'bea87892-dd1c-43aa-b257-d283e1f9b5d6',
            tid: 'cba8ca03-8b95-448d-b259-98a44d112f7c',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            nbf: Math.floor(Date.now() / 1000),
        }

        // Mock jwt.decode to return our test payload
        ;(jwt.decode as jest.Mock).mockReturnValue(tokenPayload)

        return 'mocked-valid-token'
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rate Limiting', () => {
        it('should have rate limiting middleware configured', async () => {
            // Test API endpoint which has rate limiting applied
            const response = await request(app).get('/api/v1/product-spec/count')

            expect(response.status).toBe(200)
            // Check if rate limiting headers are present (they should be with express-rate-limit)
            expect(response.headers).toHaveProperty('ratelimit-limit')
        })
    })

    describe('Security Headers', () => {
        it('should set security headers on all responses', async () => {
            const response = await request(app).get('/healthcheck')

            expect(response.headers['x-content-type-options']).toBe('nosniff')
            expect(response.headers['strict-transport-security']).toBeTruthy()
            expect(response.headers['x-xss-protection']).toBeTruthy()
            expect(response.headers['x-frame-options']).toBeTruthy()
        })
    })

    describe('Request Signature Verification', () => {
        it('should allow public endpoints without signature', async () => {
            // Temporarily enable request signing for the test
            const originalValue = process.env.ENFORCE_REQUEST_SIGNING
            process.env.ENFORCE_REQUEST_SIGNING = 'true'

            const response = await request(app).get('/healthcheck')

            expect(response.status).toBe(200)

            // Restore original setting
            process.env.ENFORCE_REQUEST_SIGNING = originalValue
        })

        it('should reject protected endpoints without valid signature when enabled', async () => {
            // Temporarily enable request signing for the test
            const originalValue = process.env.ENFORCE_REQUEST_SIGNING
            process.env.ENFORCE_REQUEST_SIGNING = 'true'

            const response = await request(app)
                .get('/api/v1/product-spec')
                .set('Authorization', `Bearer ${generateValidToken()}`)

            expect(response.status).toBe(401)
            expect(response.body.error).toContain('Missing required signature headers')

            // Restore original setting
            process.env.ENFORCE_REQUEST_SIGNING = originalValue
        })
    })
})
