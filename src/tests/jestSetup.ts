import { AzureTokenPayload } from '../types'

// Mock user payloads for testing
const mockAzureUser: AzureTokenPayload = {
    aud: 'api://10db8271-f6a1-4d55-a083-f2f76f5be6d7',
    iss: 'https://sts.windows.net/cba8ca03-8b95-448d-b259-98a44d112f7c/',
    oid: 'd974ef5d-1863-4c3e-aba5-eec51a25d944',
    sub: 'd974ef5d-1863-4c3e-aba5-eec51a25d944',
    name: 'Test User',
    given_name: 'Test',
    family_name: 'User',
    unique_name: 'test.user@anko.com',
    upn: 'test.user@anko.com',
    scp: 'Productspec.Read Productspec.Write Productspec.Admin',
    appid: '10db8271-f6a1-4d55-a083-f2f76f5be6d7',
    tid: 'cba8ca03-8b95-448d-b259-98a44d112f7c',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
}

const mockExternalUser: AzureTokenPayload = {
    aud: 'api://10db8271-f6a1-4d55-a083-f2f76f5be6d7',
    iss: 'https://sts.windows.net/cba8ca03-8b95-448d-b259-98a44d112f7c/',
    oid: 'external-user-123',
    sub: 'external-user-123',
    name: 'External User',
    given_name: 'External',
    family_name: 'User',
    unique_name: 'external.user@external.com',
    upn: 'external.user@external.com',
    scp: 'Productspec.Read',
    appid: '10db8271-f6a1-4d55-a083-f2f76f5be6d7',
    tid: 'cba8ca03-8b95-448d-b259-98a44d112f7c',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    nbf: Math.floor(Date.now() / 1000),
}

// Mock JWT for Azure AD authentication
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(),
    verify: jest.fn().mockImplementation((token) => {
        // Return different payloads based on token string
        if (token === 'valid-azure-token') {
            return mockAzureUser
        }
        if (token === 'valid-token') {
            return {
                ...mockAzureUser,
                scp: 'Productspec.Read Productspec.Write',
            }
        }
        if (token === 'anko-user-token') {
            return {
                ...mockAzureUser,
                scp: 'Productspec.Read Productspec.Write',
            }
        }
        if (token === 'external-user-token') {
            return mockExternalUser
        }
        if (token === 'read-permission-token') {
            return {
                ...mockAzureUser,
                oid: 'reader123',
                unique_name: 'reader@example.com',
                scp: 'Productspec.Read',
            }
        }
        if (token === 'write-permission-token') {
            return {
                ...mockAzureUser,
                oid: 'writer123',
                unique_name: 'writer@example.com',
                scp: 'Productspec.Write',
            }
        }
        if (token === 'admin-permission-token') {
            return {
                ...mockAzureUser,
                oid: 'admin123',
                unique_name: 'admin@example.com',
                scp: 'Productspec.Admin Productspec.Write Productspec.Read',
            }
        }
        if (token === 'logging-test-token') {
            return {
                ...mockAzureUser,
                oid: 'logging123',
                unique_name: 'logging@example.com',
                scp: 'Productspec.Read',
            }
        }
        if (token === 'limited-scope-token') {
            return {
                ...mockAzureUser,
                oid: 'limited123',
                unique_name: 'limited@example.com',
                scp: 'SomeOther.Scope', // No Productspec scopes
            }
        }

        return null
    }),
    decode: jest.fn().mockImplementation((token) => {
        // Return different payloads based on token string
        if (token === 'valid-azure-token') {
            return mockAzureUser
        }
        if (token === 'valid-token') {
            return {
                ...mockAzureUser,
                scp: 'Productspec.Read Productspec.Write',
            }
        }
        if (token === 'anko-user-token') {
            return {
                ...mockAzureUser,
                scp: 'Productspec.Read Productspec.Write',
            }
        }
        if (token === 'external-user-token') {
            return mockExternalUser
        }
        if (token === 'read-permission-token') {
            return {
                ...mockAzureUser,
                oid: 'reader123',
                unique_name: 'reader@example.com',
                scp: 'Productspec.Read',
            }
        }
        if (token === 'write-permission-token') {
            return {
                ...mockAzureUser,
                oid: 'writer123',
                unique_name: 'writer@example.com',
                scp: 'Productspec.Write',
            }
        }
        if (token === 'admin-permission-token') {
            return {
                ...mockAzureUser,
                oid: 'admin123',
                unique_name: 'admin@example.com',
                scp: 'Productspec.Admin Productspec.Write Productspec.Read',
            }
        }
        if (token === 'logging-test-token') {
            return {
                ...mockAzureUser,
                scp: 'Productspec.Read Productspec.Write',
            }
        }
        if (token === 'limited-permissions-token') {
            return {
                ...mockAzureUser,
                oid: 'limited123',
                unique_name: 'limited@example.com',
                scp: 'OtherApp.Read OtherApp.Write', // Completely different scopes, no Productspec scopes
            }
        }
        if (token === 'expired-token') {
            return {
                ...mockAzureUser,
                exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
            }
        }
        if (token === 'incomplete-token') {
            return {
                aud: 'api://10db8271-f6a1-4d55-a083-f2f76f5be6d7',
                // Missing required fields
                exp: Math.floor(Date.now() / 1000) + 3600,
            }
        }
        if (token === 'admin-token') {
            return {
                ...mockAzureUser,
                oid: 'admin-123',
                unique_name: 'admin@anko.com',
                scp: 'Productspec.Admin Productspec.Read Productspec.Write',
            }
        }
        if (token === 'mocked-valid-token') {
            return {
                ...mockAzureUser,
                scp: 'Productspec.Read Productspec.Write Productspec.Admin',
            }
        }
        // For invalid tokens
        return null
    }),
}))

// Set global environment variables for tests
process.env.NODE_ENV = 'test'
process.env.SKIP_TOKEN_VERIFICATION = 'true'
