import { Request, Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import { ApiResponse } from '../types'
import * as authService from '../services/authService'
import logger from '../utils/logger'

export const sendOTP = async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.body

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            })
        }

        // Validate phone number format (basic validation)
        const phoneRegex = /^[+]?[0-9]{10,15}$/
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format'
            })
        }

        await authService.sendOTP(phoneNumber)

        const response: ApiResponse = {
            success: true,
            message: 'OTP sent successfully to your phone number'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to send OTP:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send OTP'
        })
    }
}

export const verifyOTP = async (req: Request, res: Response) => {
    try {
        const { phoneNumber, otp } = req.body

        if (!phoneNumber || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Phone number and OTP are required'
            })
        }

        if (otp.length !== 6) {
            return res.status(400).json({
                success: false,
                error: 'OTP must be 6 digits'
            })
        }

        const result = await authService.verifyOTP(phoneNumber, otp)

        res.status(200).json(result)
    } catch (error) {
        logger.error('Failed to verify OTP:', error)
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify OTP'
        })
    }
}

export const register = async (req: Request, res: Response) => {
    try {
        const { phoneNumber, name, userType, email, profilePhoto, location } = req.body

        if (!phoneNumber || !name || !userType) {
            return res.status(400).json({
                success: false,
                error: 'Phone number, name, and user type are required'
            })
        }

        if (!['worker', 'work_provider'].includes(userType)) {
            return res.status(400).json({
                success: false,
                error: 'User type must be either "worker" or "work_provider"'
            })
        }

        const result = await authService.registerUser({ 
            phoneNumber, 
            name, 
            userType, 
            email,
            profilePhoto,
            location
        })

        res.status(201).json(result)
    } catch (error) {
        logger.error('Failed to register user:', error)
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to register user'
        })
    }
}

export const resendOTP = async (req: Request, res: Response) => {
    try {
        const { phoneNumber } = req.body

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            })
        }

        await authService.resendOTP(phoneNumber)

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully'
        })
    } catch (error) {
        logger.error('Failed to resend OTP:', error)
        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to resend OTP'
        })
    }
}

export const logout = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        await authService.logout(req.user.userId)

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })
    } catch (error) {
        logger.error('Failed to logout:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to logout'
        })
    }
}
