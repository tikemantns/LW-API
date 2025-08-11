import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import * as locationService from '../services/locationService'
import logger from '../utils/logger'

export const searchLocations = async (req: JWTAuthRequest, res: Response) => {
    try {
        const { query } = req.query

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            })
        }

        const locations = await locationService.searchLocations(query)

        res.json({
            success: true,
            data: locations
        })
    } catch (error) {
        logger.error('Failed to search locations:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to search locations'
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

        const { name, latitude, longitude, address } = req.body

        await locationService.saveUserLocation(req.user.userId, {
            name,
            latitude,
            longitude,
            address
        })

        res.json({
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

export const getUserSavedLocations = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const locations = await locationService.getUserSavedLocations(req.user.userId)

        res.json({
            success: true,
            data: locations
        })
    } catch (error) {
        logger.error('Failed to get saved locations:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get saved locations'
        })
    }
}

export const deleteLocation = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { locationId } = req.params

        await locationService.deleteUserLocation(req.user.userId, locationId)

        res.json({
            success: true,
            message: 'Location deleted successfully'
        })
    } catch (error) {
        logger.error('Failed to delete location:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to delete location'
        })
    }
}
