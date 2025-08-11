import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import { ApiResponse } from '../types'
import * as userService from '../services/userService'
import logger from '../utils/logger'

// Profile Management
export const getProfile = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const user = await userService.getUserById(req.user.userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            })
        }

        const response: ApiResponse = {
            success: true,
            data: { user }
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get user profile:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get user profile'
        })
    }
}

export const updateProfile = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { name, email, profilePhoto } = req.body
        const updatedUser = await userService.updateUser(req.user.userId, {
            name,
            email,
            profilePhoto
        })

        const response: ApiResponse = {
            success: true,
            data: { user: updatedUser },
            message: 'Profile updated successfully'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to update user profile:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update user profile'
        })
    }
}

export const uploadProfilePhoto = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { photoUrl } = req.body

        if (!photoUrl) {
            return res.status(400).json({
                success: false,
                error: 'Photo URL is required'
            })
        }

        const updatedUser = await userService.updateProfilePhoto(req.user.userId, photoUrl)

        res.status(200).json({
            success: true,
            data: { user: updatedUser },
            message: 'Profile photo updated successfully'
        })
    } catch (error) {
        logger.error('Failed to upload profile photo:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to upload profile photo'
        })
    }
}

// Location Management
export const updateLocation = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { latitude, longitude, address, pincode } = req.body

        if (!latitude || !longitude || !address) {
            return res.status(400).json({
                success: false,
                error: 'Latitude, longitude, and address are required'
            })
        }

        const updatedUser = await userService.updateUserLocation(req.user.userId, {
            latitude,
            longitude,
            address,
            pincode
        })

        const response: ApiResponse = {
            success: true,
            data: { user: updatedUser },
            message: 'Location updated successfully'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to update user location:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update user location'
        })
    }
}

export const getSavedLocations = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const locations = await userService.getSavedLocations(req.user.userId)

        res.status(200).json({
            success: true,
            data: { locations }
        })
    } catch (error) {
        logger.error('Failed to get saved locations:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get saved locations'
        })
    }
}

export const saveLocation = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { name, latitude, longitude, address, pincode } = req.body

        if (!name || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                error: 'Name, latitude, and longitude are required'
            })
        }

        await userService.saveUserLocation(req.user.userId, {
            name,
            latitude,
            longitude,
            address,
            pincode
        })

        res.status(200).json({
            success: true,
            message: 'Location saved successfully'
        })
    } catch (error) {
        logger.error('Failed to save location:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to save location'
        })
    }
}

export const removeSavedLocation = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { locationId } = req.params

        await userService.removeSavedLocation(req.user.userId, locationId)

        res.status(200).json({
            success: true,
            message: 'Location removed successfully'
        })
    } catch (error) {
        logger.error('Failed to remove saved location:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to remove saved location'
        })
    }
}

// Work Portfolio Management (for workers)
export const getPortfolio = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const portfolio = await userService.getWorkPortfolio(req.user.userId)

        res.status(200).json({
            success: true,
            data: { portfolio }
        })
    } catch (error) {
        logger.error('Failed to get portfolio:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get portfolio'
        })
    }
}

export const addPortfolioMedia = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { type, url, description } = req.body

        if (!type || !url || !['image', 'video'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Valid type (image/video) and URL are required'
            })
        }

        const portfolio = await userService.addPortfolioMedia(req.user.userId, {
            type,
            url,
            description
        })

        res.status(200).json({
            success: true,
            data: { portfolio },
            message: 'Portfolio media added successfully'
        })
    } catch (error) {
        logger.error('Failed to add portfolio media:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to add portfolio media'
        })
    }
}

export const removePortfolioMedia = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { mediaId } = req.params
        const { type } = req.body

        if (!['image', 'video'].includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Valid type (image/video) is required'
            })
        }

        await userService.removePortfolioMedia(req.user.userId, mediaId, type)

        res.status(200).json({
            success: true,
            message: 'Portfolio media removed successfully'
        })
    } catch (error) {
        logger.error('Failed to remove portfolio media:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to remove portfolio media'
        })
    }
}

export const updatePortfolio = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { skills, experience, hourlyRate, availableCategories } = req.body

        const portfolio = await userService.updateWorkPortfolio(req.user.userId, {
            skills,
            experience,
            hourlyRate,
            availableCategories
        })

        res.status(200).json({
            success: true,
            data: { portfolio },
            message: 'Portfolio updated successfully'
        })
    } catch (error) {
        logger.error('Failed to update portfolio:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update portfolio'
        })
    }
}

// Availability Management
export const getAvailability = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const availability = await userService.getUserAvailability(req.user.userId)

        res.status(200).json({
            success: true,
            data: { availability }
        })
    } catch (error) {
        logger.error('Failed to get availability:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get availability'
        })
    }
}

export const updateAvailability = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { schedule } = req.body

        const availability = await userService.updateUserAvailability(req.user.userId, schedule)

        res.status(200).json({
            success: true,
            data: { availability },
            message: 'Availability updated successfully'
        })
    } catch (error) {
        logger.error('Failed to update availability:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update availability'
        })
    }
}

export const updateAvailabilityStatus = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { status } = req.body

        if (!['available', 'busy', 'offline'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Valid status (available/busy/offline) is required'
            })
        }

        await userService.updateAvailabilityStatus(req.user.userId, status)

        res.status(200).json({
            success: true,
            message: `Status updated to ${status}`
        })
    } catch (error) {
        logger.error('Failed to update availability status:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update availability status'
        })
    }
}

// Premium Plan Management
export const getPremiumPlan = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const premiumPlan = await userService.getPremiumPlan(req.user.userId)

        res.status(200).json({
            success: true,
            data: { premiumPlan }
        })
    } catch (error) {
        logger.error('Failed to get premium plan:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get premium plan'
        })
    }
}

export const upgradePremium = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { planType, paymentId } = req.body

        if (!['premium', 'enterprise'].includes(planType)) {
            return res.status(400).json({
                success: false,
                error: 'Valid plan type (premium/enterprise) is required'
            })
        }

        const premiumPlan = await userService.upgradePremiumPlan(req.user.userId, planType, paymentId)

        res.status(200).json({
            success: true,
            data: { premiumPlan },
            message: `Successfully upgraded to ${planType} plan`
        })
    } catch (error) {
        logger.error('Failed to upgrade premium plan:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to upgrade premium plan'
        })
    }
}

// App Settings
export const getAppSettings = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const settings = await userService.getAppSettings(req.user.userId)

        res.status(200).json({
            success: true,
            data: { settings }
        })
    } catch (error) {
        logger.error('Failed to get app settings:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get app settings'
        })
    }
}

export const updateAppSettings = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { pushNotifications, locationServices, language, theme } = req.body

        const settings = await userService.updateAppSettings(req.user.userId, {
            pushNotifications,
            locationServices,
            language,
            theme
        })

        res.status(200).json({
            success: true,
            data: { settings },
            message: 'App settings updated successfully'
        })
    } catch (error) {
        logger.error('Failed to update app settings:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update app settings'
        })
    }
}

// Statistics and Achievements
export const getUserStatistics = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const statistics = await userService.getUserStatistics(req.user.userId)

        res.status(200).json({
            success: true,
            data: { statistics }
        })
    } catch (error) {
        logger.error('Failed to get user statistics:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get user statistics'
        })
    }
}

export const getUserAchievements = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const achievements = await userService.getUserAchievements(req.user.userId)

        res.status(200).json({
            success: true,
            data: { achievements }
        })
    } catch (error) {
        logger.error('Failed to get user achievements:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get user achievements'
        })
    }
}

// Device Management
export const registerDeviceToken = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { token, platform } = req.body

        if (!token || !['android', 'ios'].includes(platform)) {
            return res.status(400).json({
                success: false,
                error: 'Valid token and platform (android/ios) are required'
            })
        }

        await userService.registerDeviceToken(req.user.userId, { token, platform })

        res.status(200).json({
            success: true,
            message: 'Device token registered successfully'
        })
    } catch (error) {
        logger.error('Failed to register device token:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to register device token'
        })
    }
}

export const removeDeviceToken = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { token } = req.body

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Device token is required'
            })
        }

        await userService.removeDeviceToken(req.user.userId, token)

        res.status(200).json({
            success: true,
            message: 'Device token removed successfully'
        })
    } catch (error) {
        logger.error('Failed to remove device token:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to remove device token'
        })
    }
}
