/**
 * Types for Azure AD authentication middleware and JWT token handling
 */

import { Request } from 'express'

// Azure AD token payload structure
export interface AzureTokenPayload {
    aud: string // Audience (client ID)
    iss: string // Issuer (Azure AD)
    oid: string // Object ID (user ID)
    sub: string // Subject
    name: string // Full name
    given_name: string // First name
    family_name: string // Last name
    unique_name: string // Email
    upn: string // User Principal Name
    scp: string // Scopes (permissions)
    appid: string // Application ID
    tid: string // Tenant ID
    iat: number // Issued at time
    exp: number // Expiration time
    nbf: number // Not before time
}

// Legacy token payload for backward compatibility
export interface TokenPayload {
    userId: string
    role: string
    permissions: string[]
    jti?: string // JWT ID for token revocation (optional since we only verify tokens)
    fingerprint?: string // Browser fingerprint for token binding (optional)
    iat?: number // Issued at time
    exp?: number // Expiration time
}

// AuthRequest extends Express Request and adds user and token properties
export interface AuthRequest extends Request {
    user?: AzureTokenPayload
    token?: string
}

// Helper function to get user role from Azure AD token
export const getUserRole = (user?: AzureTokenPayload): string => {
    if (!user) return 'user'
    // Determine role based on email domain or other logic
    return user.unique_name?.endsWith('@anko.com') ? 'admin' : 'user'
}

// Helper function to get user ID from Azure AD token
export const getUserId = (user?: AzureTokenPayload): string => {
    return user?.oid || user?.unique_name || 'unknown'
}
