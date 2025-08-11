import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import * as userController from '../controllers/userController'

const router = Router()

// Profile management
router.get('/profile', verifyToken, userController.getProfile)
router.put('/profile', verifyToken, userController.updateProfile)
router.post('/profile/photo', verifyToken, userController.uploadProfilePhoto)

// Work portfolio management (for workers)
router.get('/portfolio', verifyToken, userController.getPortfolio)
router.post('/portfolio/media', verifyToken, userController.addPortfolioMedia)
router.delete('/portfolio/media/:mediaId', verifyToken, userController.removePortfolioMedia)
router.put('/portfolio', verifyToken, userController.updatePortfolio)

// Availability management
router.get('/availability', verifyToken, userController.getAvailability)
router.put('/availability', verifyToken, userController.updateAvailability)
router.post('/availability/status', verifyToken, userController.updateAvailabilityStatus)

// Premium plan management
router.get('/premium', verifyToken, userController.getPremiumPlan)
router.post('/premium/upgrade', verifyToken, userController.upgradePremium)

// Location management
router.get('/saved-locations', verifyToken, userController.getSavedLocations)
router.post('/saved-locations', verifyToken, userController.saveLocation)
router.delete('/saved-locations/:locationId', verifyToken, userController.removeSavedLocation)
router.post('/location', verifyToken, userController.updateLocation)

// App settings
router.get('/settings', verifyToken, userController.getAppSettings)
router.put('/settings', verifyToken, userController.updateAppSettings)

// User statistics and achievements
router.get('/statistics', verifyToken, userController.getUserStatistics)
router.get('/achievements', verifyToken, userController.getUserAchievements)

// Device management for push notifications
router.post('/device-token', verifyToken, userController.registerDeviceToken)
router.delete('/device-token', verifyToken, userController.removeDeviceToken)

export default router
