import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import {
    searchLocations,
    reverseGeocode,
    saveLocation,
    getUserSavedLocations,
    deleteLocation
} from '../controllers/locationController'

const router = Router()

// Location routes
router.get('/search', searchLocations)
router.get('/reverse-geocode', reverseGeocode)
router.post('/save', verifyToken, saveLocation)
router.get('/saved', verifyToken, getUserSavedLocations)
router.delete('/:locationId', verifyToken, deleteLocation)

export default router