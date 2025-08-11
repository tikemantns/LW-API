/**
 * Token Helper Utilities
 *
 * Since we only verify tokens (not generate them), this helper provides
 * utilities for token validation and extraction for testing and debugging.
 */

import jwt from 'jsonwebtoken'
import { TokenPayload } from '../types'

/**
 * Decode a JWT token without verification (for debugging)
 * WARNING: This should only be used for debugging, not for authentication
 */
export const decodeTokenUnsafe = (token: string): TokenPayload | null => {
    try {
        const decoded = jwt.decode(token) as TokenPayload
        return decoded
    } catch (error) {
        return null
    }
}

/**
 * Check if a token is expired without verification
 */
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwt.decode(token) as TokenPayload
        if (!decoded || !decoded.exp) return true

        const now = Math.floor(Date.now() / 1000)
        return decoded.exp < now
    } catch (error) {
        return true
    }
}

/**
 * Extract token expiration time
 */
export const getTokenExpiration = (token: string): Date | null => {
    try {
        const decoded = jwt.decode(token) as TokenPayload
        if (!decoded || !decoded.exp) return null

        return new Date(decoded.exp * 1000)
    } catch (error) {
        return null
    }
}

/**
 * Extract user info from token without verification (for debugging)
 */
export const extractUserInfo = (token: string): Partial<TokenPayload> | null => {
    try {
        const decoded = jwt.decode(token) as TokenPayload
        if (!decoded) return null

        return {
            userId: decoded.userId,
            role: decoded.role,
            permissions: decoded.permissions,
        }
    } catch (error) {
        return null
    }
}

/**
 * Validate token format (basic check)
 */
export const isValidTokenFormat = (token: string): boolean => {
    if (!token || typeof token !== 'string') return false

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    return parts.length === 3 && parts.every((part) => part.length > 0)
}
