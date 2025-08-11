import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models'
import logger from '../utils/logger'

export interface JWTAuthRequest extends Request {
    user?: {
        userId: string
        phoneNumber: string
        userType: string
    }
}

export const verifyToken = async (req: JWTAuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req)

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any

        if (!decoded.userId) {
            return res.status(403).json({
                success: false,
                error: 'Invalid token'
            })
        }

        // Get user from database
        const user = await User.findById(decoded.userId)
        
        if (!user) {
            return res.status(403).json({
                success: false,
                error: 'User not found'
            })
        }

        req.user = {
            userId: user._id.toString(),
            phoneNumber: user.phoneNumber,
            userType: user.userType
        }

        next()
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            })
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({
                success: false,
                error: 'Invalid token'
            })
        } else {
            logger.error('Token verification error:', error)
            return res.status(500).json({
                success: false,
                error: 'Authentication error'
            })
        }
    }
}

const extractToken = (req: Request): string | null => {
    const authHeader = req.header('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '')
    }
    return null
}

export const optionalAuth = async (req: JWTAuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = extractToken(req)
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
            
            if (decoded.userId) {
                const user = await User.findById(decoded.userId)
                if (user) {
                    req.user = {
                        userId: user._id.toString(),
                        phoneNumber: user.phoneNumber,
                        userType: user.userType
                    }
                }
            }
        }
        
        next()
    } catch (error) {
        // For optional auth, we continue even if token is invalid
        next()
    }
}

