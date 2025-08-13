import { User } from '../models'
import { User as IUser } from '../types/lw'
import logger from '../utils/logger'

export const searchLocations = async (query: string) => {
    try {
        // This would integrate with a geocoding service like Google Maps API
        // For now, return mock data
        const mockLocations = [
            {
                id: '1',
                name: `${query} - Location 1`,
                address: `123 ${query} Street, City, State`,
                latitude: 40.7128,
                longitude: -74.0060
            },
            {
                id: '2', 
                name: `${query} - Location 2`,
                address: `456 ${query} Avenue, City, State`,
                latitude: 40.7589,
                longitude: -73.9851
            }
        ]

        return mockLocations
    } catch (error) {
        logger.error('Error searching locations:', error)
        throw new Error('Failed to search locations')
    }
}

export const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
        // This would integrate with a reverse geocoding service like Google Maps API
        // For now, return mock data based on coordinates
        const mockLocation = {
            address: `${Math.round(latitude * 1000) / 1000} St, ${Math.round(longitude * 1000) / 1000} Ave`,
            city: 'Sample City',
            state: 'Sample State',
            country: 'Sample Country',
            postalCode: '12345',
            latitude,
            longitude,
            formattedAddress: `${Math.round(latitude * 1000) / 1000} St, Sample City, Sample State 12345`
        }

        return mockLocation
    } catch (error) {
        logger.error('Error in reverse geocoding:', error)
        throw new Error('Failed to reverse geocode location')
    }
}

export const saveUserLocation = async (userId: string, locationData: {
    name: string
    latitude: number
    longitude: number
    address: string
}) => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new Error('User not found')
        }

        // Add to saved locations if not already exists
        const exists = user.savedLocations?.some(
            loc => loc.latitude === locationData.latitude && 
                   loc.longitude === locationData.longitude
        )

        if (!exists) {
            user.savedLocations = user.savedLocations || []
            user.savedLocations.push(locationData)
            await user.save()
        }

        return user.savedLocations
    } catch (error) {
        logger.error('Error saving user location:', error)
        throw new Error('Failed to save location')
    }
}

export const getUserSavedLocations = async (userId: string) => {
    try {
        const user = await User.findById(userId).select('savedLocations')
        if (!user) {
            throw new Error('User not found')
        }

        return user.savedLocations || []
    } catch (error) {
        logger.error('Error getting user saved locations:', error)
        throw new Error('Failed to get saved locations')
    }
}

export const deleteUserLocation = async (userId: string, locationId: string) => {
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
        }

        await user.save()
        return true
    } catch (error) {
        logger.error('Error deleting user location:', error)
        throw new Error('Failed to delete location')
    }
}

export const getNearbyLocations = async (latitude: number, longitude: number, radius = 5) => {
    try {
        // This would use geospatial queries to find nearby works/users within radius km
        // For now, return mock data
        logger.debug('Searching within radius:', radius)
        const nearbyItems = [
            {
                type: 'work',
                id: '1',
                title: 'Plumbing Work',
                distance: 2.5,
                coordinates: { latitude: latitude + 0.01, longitude: longitude + 0.01 }
            },
            {
                type: 'user',
                id: '2', 
                name: 'John Doe',
                distance: 1.2,
                coordinates: { latitude: latitude - 0.005, longitude: longitude + 0.005 }
            }
        ]

        return nearbyItems
    } catch (error) {
        logger.error('Error getting nearby locations:', error)
        throw new Error('Failed to get nearby locations')
    }
}
