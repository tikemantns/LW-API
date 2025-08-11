import { User } from '../models'
import logger from '../utils/logger'

// Profile Management
export const getUserById = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('-__v')
        return user
    } catch (error) {
        logger.error('Failed to get user by ID:', error)
        throw new Error('Failed to get user')
    }
}

export const updateUser = async (userId: string, updateData: {
    name?: string
    email?: string
    profilePhoto?: string
}) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-__v')

        if (!user) {
            throw new Error('User not found')
        }

        return user
    } catch (error) {
        logger.error('Failed to update user:', error)
        throw new Error('Failed to update user')
    }
}

export const updateProfilePhoto = async (userId: string, photoUrl: string) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePhoto: photoUrl } },
            { new: true, runValidators: true }
        ).select('-__v')

        if (!user) {
            throw new Error('User not found')
        }

        return user
    } catch (error) {
        logger.error('Failed to update profile photo:', error)
        throw new Error('Failed to update profile photo')
    }
}

// Location Management
export const updateUserLocation = async (userId: string, location: {
    latitude: number
    longitude: number
    address: string
    pincode?: string
}) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    location: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        address: location.address,
                        pincode: location.pincode
                    }
                }
            },
            { new: true, runValidators: true }
        ).select('-__v')

        if (!user) {
            throw new Error('User not found')
        }

        return user
    } catch (error) {
        logger.error('Failed to update user location:', error)
        throw new Error('Failed to update user location')
    }
}

export const getSavedLocations = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('savedLocations')
        
        if (!user) {
            throw new Error('User not found')
        }

        return user.savedLocations || []
    } catch (error) {
        logger.error('Failed to get saved locations:', error)
        throw new Error('Failed to get saved locations')
    }
}

export const saveUserLocation = async (userId: string, locationData: {
    name: string
    latitude: number
    longitude: number
    address: string
    pincode?: string
}) => {
    try {
        const user = await User.findById(userId)
        
        if (!user) {
            throw new Error('User not found')
        }

        // Check if location already exists
        const exists = user.savedLocations?.some(
            loc => loc.name === locationData.name || 
                  (loc.latitude === locationData.latitude && loc.longitude === locationData.longitude)
        )

        if (!exists) {
            user.savedLocations = user.savedLocations || []
            user.savedLocations.push(locationData)
            await user.save()
        }

        return user.savedLocations
    } catch (error) {
        logger.error('Failed to save user location:', error)
        throw new Error('Failed to save location')
    }
}

export const removeSavedLocation = async (userId: string, locationId: string) => {
    try {
        const user = await User.findById(userId)
        
        if (!user) {
            throw new Error('User not found')
        }

        // Find and remove the location by its _id
        const locationIndex = user.savedLocations.findIndex(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (loc: any) => loc._id && loc._id.toString() === locationId
        )
        
        if (locationIndex > -1) {
            user.savedLocations.splice(locationIndex, 1)
            await user.save()
        }

        return true
    } catch (error) {
        logger.error('Failed to remove saved location:', error)
        throw new Error('Failed to remove location')
    }
}

// Work Portfolio Management
export const getWorkPortfolio = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('workPortfolio')
        
        if (!user) {
            throw new Error('User not found')
        }

        return user.workPortfolio || {
            images: [],
            videos: [],
            skills: [],
            experience: '',
            hourlyRate: 0,
            availableCategories: []
        }
    } catch (error) {
        logger.error('Failed to get work portfolio:', error)
        throw new Error('Failed to get work portfolio')
    }
}

export const addPortfolioMedia = async (userId: string, mediaData: {
    type: 'image' | 'video'
    url: string
    description?: string
}) => {
    try {
        const user = await User.findById(userId)
        
        if (!user) {
            throw new Error('User not found')
        }

        if (!user.workPortfolio) {
            user.workPortfolio = {
                images: [],
                videos: [],
                skills: [],
                experience: '',
                availableCategories: []
            }
        }

        if (mediaData.type === 'image') {
            user.workPortfolio.images.push(mediaData.url)
        } else if (mediaData.type === 'video') {
            user.workPortfolio.videos.push(mediaData.url)
        }

        await user.save()
        return user.workPortfolio
    } catch (error) {
        logger.error('Failed to add portfolio media:', error)
        throw new Error('Failed to add portfolio media')
    }
}

export const removePortfolioMedia = async (userId: string, mediaUrl: string, type: 'image' | 'video') => {
    try {
        const user = await User.findById(userId)
        
        if (!user) {
            throw new Error('User not found')
        }

        if (user.workPortfolio) {
            if (type === 'image') {
                user.workPortfolio.images = user.workPortfolio.images.filter(url => url !== mediaUrl)
            } else if (type === 'video') {
                user.workPortfolio.videos = user.workPortfolio.videos.filter(url => url !== mediaUrl)
            }
            
            await user.save()
        }

        return true
    } catch (error) {
        logger.error('Failed to remove portfolio media:', error)
        throw new Error('Failed to remove portfolio media')
    }
}

export const updateWorkPortfolio = async (userId: string, portfolioData: {
    skills?: string[]
    experience?: string
    hourlyRate?: number
    availableCategories?: string[]
}) => {
    try {
        const user = await User.findById(userId)
        
        if (!user) {
            throw new Error('User not found')
        }

        if (!user.workPortfolio) {
            user.workPortfolio = {
                images: [],
                videos: [],
                skills: [],
                experience: '',
                availableCategories: []
            }
        }

        if (portfolioData.skills) user.workPortfolio.skills = portfolioData.skills
        if (portfolioData.experience) user.workPortfolio.experience = portfolioData.experience
        if (portfolioData.hourlyRate) user.workPortfolio.hourlyRate = portfolioData.hourlyRate
        if (portfolioData.availableCategories) user.workPortfolio.availableCategories = portfolioData.availableCategories

        await user.save()
        return user.workPortfolio
    } catch (error) {
        logger.error('Failed to update work portfolio:', error)
        throw new Error('Failed to update work portfolio')
    }
}

// Availability Management
export const getUserAvailability = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('availability')
        
        if (!user) {
            throw new Error('User not found')
        }

        return user.availability || {
            status: 'available',
            schedule: {},
            lastActive: new Date()
        }
    } catch (error) {
        logger.error('Failed to get user availability:', error)
        throw new Error('Failed to get user availability')
    }
}

export const updateUserAvailability = async (userId: string, schedule: Record<string, unknown>) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    'availability.schedule': schedule,
                    'availability.lastActive': new Date()
                }
            },
            { new: true, runValidators: true }
        ).select('availability')

        if (!user) {
            throw new Error('User not found')
        }

        return user.availability
    } catch (error) {
        logger.error('Failed to update user availability:', error)
        throw new Error('Failed to update user availability')
    }
}

export const updateAvailabilityStatus = async (userId: string, status: 'available' | 'busy' | 'offline') => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    'availability.status': status,
                    'availability.lastActive': new Date()
                }
            },
            { new: true, runValidators: true }
        )

        if (!user) {
            throw new Error('User not found')
        }

        return user
    } catch (error) {
        logger.error('Failed to update availability status:', error)
        throw new Error('Failed to update availability status')
    }
}

// Premium Plan Management
export const getPremiumPlan = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('premiumPlan')
        
        if (!user) {
            throw new Error('User not found')
        }

        return user.premiumPlan || {
            type: 'basic',
            features: ['basic_search'],
            paymentStatus: 'active'
        }
    } catch (error) {
        logger.error('Failed to get premium plan:', error)
        throw new Error('Failed to get premium plan')
    }
}

export const upgradePremiumPlan = async (userId: string, planType: 'premium' | 'enterprise', _paymentId?: string) => {
    try {
        const features = planType === 'premium' ? 
            ['advanced_search', 'priority_support', 'analytics', 'portfolio_boost'] :
            ['all_premium_features', 'dedicated_support', 'custom_analytics', 'priority_listing']

        const expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 1) // 1 year from now

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    'premiumPlan.type': planType,
                    'premiumPlan.features': features,
                    'premiumPlan.expiresAt': expiresAt,
                    'premiumPlan.paymentStatus': 'active'
                }
            },
            { new: true, runValidators: true }
        ).select('premiumPlan')

        if (!user) {
            throw new Error('User not found')
        }

        return user.premiumPlan
    } catch (error) {
        logger.error('Failed to upgrade premium plan:', error)
        throw new Error('Failed to upgrade premium plan')
    }
}

// App Settings
export const getAppSettings = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('appSettings')
        
        if (!user) {
            throw new Error('User not found')
        }

        return user.appSettings || {
            pushNotifications: true,
            locationServices: true,
            language: 'en',
            theme: 'light'
        }
    } catch (error) {
        logger.error('Failed to get app settings:', error)
        throw new Error('Failed to get app settings')
    }
}

export const updateAppSettings = async (userId: string, settings: {
    pushNotifications?: boolean
    locationServices?: boolean
    language?: string
    theme?: 'light' | 'dark'
}) => {
    try {
        const updateObj: Record<string, unknown> = {}
        
        if (settings.pushNotifications !== undefined) updateObj['appSettings.pushNotifications'] = settings.pushNotifications
        if (settings.locationServices !== undefined) updateObj['appSettings.locationServices'] = settings.locationServices
        if (settings.language) updateObj['appSettings.language'] = settings.language
        if (settings.theme) updateObj['appSettings.theme'] = settings.theme

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateObj },
            { new: true, runValidators: true }
        ).select('appSettings')

        if (!user) {
            throw new Error('User not found')
        }

        return user.appSettings
    } catch (error) {
        logger.error('Failed to update app settings:', error)
        throw new Error('Failed to update app settings')
    }
}

// Statistics and Achievements
export const getUserStatistics = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('statistics')
        
        if (!user) {
            throw new Error('User not found')
        }

        return user.statistics || {
            totalWorksCompleted: 0,
            totalWorksPosted: 0,
            averageRating: 0,
            totalEarnings: 0,
            responseTime: 0
        }
    } catch (error) {
        logger.error('Failed to get user statistics:', error)
        throw new Error('Failed to get user statistics')
    }
}

export const getUserAchievements = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('statistics premiumPlan')
        
        if (!user) {
            throw new Error('User not found')
        }

        const stats = user.statistics || { totalWorksCompleted: 0, averageRating: 0, totalEarnings: 0 }
        const achievements = []

        // Define achievements based on user statistics
        if (stats.totalWorksCompleted >= 1) achievements.push({ 
            id: 'first_work', 
            title: 'First Work Completed', 
            description: 'Completed your first work',
            icon: '🎉',
            unlockedAt: new Date()
        })

        if (stats.totalWorksCompleted >= 10) achievements.push({
            id: 'work_veteran',
            title: 'Work Veteran',
            description: 'Completed 10 works',
            icon: '⭐',
            unlockedAt: new Date()
        })

        if (stats.averageRating >= 4.5) achievements.push({
            id: 'five_star_pro',
            title: 'Five Star Professional',
            description: 'Maintained 4.5+ star rating',
            icon: '🌟',
            unlockedAt: new Date()
        })

        if (stats.totalEarnings >= 10000) achievements.push({
            id: 'earning_milestone',
            title: 'Earning Milestone',
            description: 'Earned ₹10,000+',
            icon: '💰',
            unlockedAt: new Date()
        })

        if (user.premiumPlan?.type !== 'basic') achievements.push({
            id: 'premium_member',
            title: 'Premium Member',
            description: 'Upgraded to premium plan',
            icon: '👑',
            unlockedAt: new Date()
        })

        return achievements
    } catch (error) {
        logger.error('Failed to get user achievements:', error)
        throw new Error('Failed to get user achievements')
    }
}

// Device Management
export const registerDeviceToken = async (userId: string, deviceData: {
    token: string
    platform: 'android' | 'ios'
}) => {
    try {
        const user = await User.findById(userId)
        
        if (!user) {
            throw new Error('User not found')
        }

        // Remove existing token if it exists
        user.deviceTokens = user.deviceTokens.filter(
            token => token.token !== deviceData.token
        )

        // Add new token
        user.deviceTokens.push({
            token: deviceData.token,
            platform: deviceData.platform
        })

        await user.save()
        return user
    } catch (error) {
        logger.error('Failed to register device token:', error)
        throw new Error('Failed to register device token')
    }
}

export const removeDeviceToken = async (userId: string, tokenToRemove: string) => {
    try {
        const user = await User.findById(userId)
        
        if (!user) {
            throw new Error('User not found')
        }

        // Remove the specified token
        user.deviceTokens = user.deviceTokens.filter(
            token => token.token !== tokenToRemove
        )

        await user.save()
        return user
    } catch (error) {
        logger.error('Failed to remove device token:', error)
        throw new Error('Failed to remove device token')
    }
}

// Legacy method for backward compatibility
export const updateDeviceToken = async (userId: string, deviceData: {
    deviceToken: string
    platform: 'android' | 'ios'
}) => {
    return registerDeviceToken(userId, {
        token: deviceData.deviceToken,
        platform: deviceData.platform
    })
}
