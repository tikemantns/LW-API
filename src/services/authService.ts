import jwt from 'jsonwebtoken'
import { User, OTP } from '../models'
import { ApiResponse } from '../types'
import logger from '../utils/logger'

// Generate 6-digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate JWT token
const generateToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
    )
}

/**
 * Send OTP - Independent from registration
 * This only sends OTP and doesn't create user account
 */
export const sendOTP = async (phoneNumber: string): Promise<void> => {
    try {
        // Generate OTP
        const otp = generateOTP()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Delete any existing OTPs for this phone number
        await OTP.deleteMany({ phoneNumber })

        // Save new OTP
        await OTP.create({
            phoneNumber,
            otp,
            expiresAt,
            attempts: 0
        })

        // In production, integrate with SMS service
        logger.info(`OTP for ${phoneNumber}: ${otp}`)
        
        // TODO: Integrate with SMS gateway
        // Examples: Twilio, AWS SNS, MSG91, Fast2SMS
        // await smsService.send(phoneNumber, `Your Local Work OTP is: ${otp}. Valid for 10 minutes.`)
        
    } catch (error) {
        logger.error('Failed to send OTP:', error)
        throw new Error('Failed to send OTP')
    }
}

/**
 * Verify OTP - Independent from registration
 * Returns whether user exists or is new (needs registration)
 */
export const verifyOTP = async (phoneNumber: string, otp: string): Promise<ApiResponse> => {
    try {
        // Find valid OTP
        const otpRecord = await OTP.findOne({
            phoneNumber,
            verified: false,
            expiresAt: { $gt: new Date() }
        })

        if (!otpRecord) {
            throw new Error('No OTP found for this phone number')
        }

        // Check OTP attempts
        if (otpRecord.attempts >= 5) {
            throw new Error('Too many invalid attempts. Please request a new OTP.')
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1
            await otpRecord.save()
            throw new Error('Invalid OTP')
        }

        // Mark OTP as verified
        otpRecord.verified = true
        await otpRecord.save()

        // Check if user exists
        const existingUser = await User.findOne({ phoneNumber })
        
        if (existingUser) {
            // Existing user - mark as verified and return with token
            existingUser.isVerified = true
            await existingUser.save()

            const token = generateToken(existingUser._id.toString())

            return {
                success: true,
                data: {
                    token,
                    user: {
                        id: existingUser._id,
                        phoneNumber: existingUser.phoneNumber,
                        name: existingUser.name,
                        email: existingUser.email,
                        userType: existingUser.userType,
                        isVerified: existingUser.isVerified,
                        profilePhoto: existingUser.profilePhoto,
                        location: existingUser.location,
                        premiumPlan: existingUser.premiumPlan
                    },
                    isNewUser: false,
                    needsRegistration: false
                },
                message: 'OTP verified successfully. Welcome back!'
            }
        } else {
            // New user - OTP verified but needs registration
            return {
                success: true,
                data: {
                    phoneNumber,
                    isNewUser: true,
                    needsRegistration: true,
                    otpVerified: true
                },
                message: 'OTP verified successfully. Please complete your registration.'
            }
        }
    } catch (error) {
        logger.error('Failed to verify OTP:', error)
        throw error
    }
}

/**
 * Register User - Separate from OTP verification
 * Only called for new users after OTP verification
 */
export const registerUser = async (userData: {
    phoneNumber: string
    name: string
    userType: 'worker' | 'work_provider'
    email?: string
    profilePhoto?: string
    location?: {
        latitude?: number
        longitude?: number
        pincode?: string
        address?: string
    }
}): Promise<ApiResponse> => {
    try {
        // Verify that OTP was verified for this phone number
        const verifiedOTP = await OTP.findOne({
            phoneNumber: userData.phoneNumber,
            verified: true
        }).sort({ createdAt: -1 }) // Get the latest verified OTP

        if (!verifiedOTP) {
            throw new Error('Please verify your phone number first')
        }

        // Check if OTP verification was recent (within 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
        if (verifiedOTP.updatedAt < thirtyMinutesAgo) {
            throw new Error('OTP verification expired. Please verify again.')
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phoneNumber: userData.phoneNumber })
        if (existingUser) {
            throw new Error('User already registered with this phone number')
        }

        // Create new user with enhanced fields
        const newUser = await User.create({
            phoneNumber: userData.phoneNumber,
            name: userData.name,
            userType: userData.userType,
            email: userData.email,
            profilePhoto: userData.profilePhoto,
            location: userData.location,
            isVerified: true,
            workPortfolio: {
                images: [],
                videos: [],
                skills: [],
                experience: '',
                availableCategories: []
            },
            availability: {
                status: 'available',
                lastActive: new Date()
            },
            premiumPlan: {
                type: 'basic',
                features: ['basic_search', 'standard_support'],
                paymentStatus: 'active'
            },
            appSettings: {
                pushNotifications: true,
                locationServices: true,
                language: 'en',
                theme: 'light'
            },
            statistics: {
                totalWorksCompleted: 0,
                totalWorksPosted: 0,
                averageRating: 0,
                totalEarnings: 0,
                responseTime: 0
            }
        })

        // Generate token
        const token = generateToken(newUser._id.toString())

        // Clean up used OTP
        await OTP.deleteOne({ _id: verifiedOTP._id })

        return {
            success: true,
            data: {
                token,
                user: {
                    id: newUser._id,
                    phoneNumber: newUser.phoneNumber,
                    name: newUser.name,
                    email: newUser.email,
                    userType: newUser.userType,
                    isVerified: newUser.isVerified,
                    profilePhoto: newUser.profilePhoto,
                    location: newUser.location,
                    workPortfolio: newUser.workPortfolio,
                    availability: newUser.availability,
                    premiumPlan: newUser.premiumPlan
                },
                isNewUser: true
            },
            message: 'Registration completed successfully! Welcome to Local Work!'
        }
    } catch (error) {
        logger.error('Failed to register user:', error)
        throw error
    }
}

/**
 * Resend OTP
 */
export const resendOTP = async (phoneNumber: string): Promise<void> => {
    try {
        // Check if there's a recent OTP (less than 1 minute old)
        const recentOTP = await OTP.findOne({
            phoneNumber,
            createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // 1 minute
        })

        if (recentOTP) {
            throw new Error('Please wait before requesting a new OTP')
        }

        // Send new OTP
        await sendOTP(phoneNumber)
    } catch (error) {
        logger.error('Failed to resend OTP:', error)
        throw error
    }
}

/**
 * Logout user
 */
export const logout = async (userId: string): Promise<void> => {
    try {
        const user = await User.findById(userId)
        if (user) {
            // Update availability status to offline
            user.availability.status = 'offline'
            user.availability.lastActive = new Date()
            
            // Optionally clear device tokens for push notifications
            // user.deviceTokens = []
            
            await user.save()
        }
        
        logger.info(`User ${userId} logged out`)
    } catch (error) {
        logger.error('Failed to logout user:', error)
        throw new Error('Failed to logout')
    }
}
