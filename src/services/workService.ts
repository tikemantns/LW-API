import { Work } from '../models'
import { Types } from 'mongoose'
import logger from '../utils/logger'

export const getWorks = async (filters: {
    category?: string
    location?: string
    radius?: number
    page: number
    limit: number
    sortBy?: string
}) => {
    try {
        const { category, location, radius, page, limit, sortBy } = filters
        const skip = (page - 1) * limit

        const query: any = { status: 'active' }

        if (category) {
            query.category = new RegExp(category, 'i')
        }

        if (location) {
            query.location = new RegExp(location, 'i')
        }

        // If radius is provided and we have coordinates, implement geo search
        // This would require implementing geospatial queries

        let sortOption: any = { createdAt: -1 }
        if (sortBy) {
            switch (sortBy) {
            case 'pay_high':
                sortOption = { pay: -1 }
                break
            case 'pay_low':
                sortOption = { pay: 1 }
                break
            case 'newest':
                sortOption = { createdAt: -1 }
                break
            case 'oldest':
                sortOption = { createdAt: 1 }
                break
            }
        }

        const [works, total] = await Promise.all([
            Work.find(query)
                .populate('postedBy', 'name userType')
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean(),
            Work.countDocuments(query)
        ])

        return {
            works,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        }
    } catch (error) {
        logger.error('Failed to get works:', error)
        throw new Error('Failed to get works')
    }
}

export const createWork = async (workData: {
    title: string
    description: string
    category: string
    location: string
    pay: string
    duration: string
    requirements: string[]
    postedBy: string
}) => {
    try {
        const work = await Work.create(workData)
        return await Work.findById(work._id).populate('postedBy', 'name userType')
    } catch (error) {
        logger.error('Failed to create work:', error)
        throw new Error('Failed to create work')
    }
}

export const getWorkById = async (workId: string) => {
    try {
        const work = await Work.findById(workId)
            .populate('postedBy', 'name userType phoneNumber')
            // .populate('applicants.user', 'name userType')
            // .populate('selectedWorker', 'name userType')

        return work
    } catch (error) {
        logger.error('Failed to get work by ID:', error)
        throw new Error('Failed to get work')
    }
}

export const updateWork = async (workId: string, userId: string, updateData: any) => {
    try {
        const work = await Work.findOne({ _id: workId, postedBy: userId })

        if (!work) {
            throw new Error('Work not found or you do not have permission to update it')
        }

        const updatedWork = await Work.findByIdAndUpdate(
            workId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('postedBy', 'name userType')

        return updatedWork
    } catch (error) {
        logger.error('Failed to update work:', error)
        throw error
    }
}

export const deleteWork = async (workId: string, userId: string) => {
    try {
        const work = await Work.findOne({ _id: workId, postedBy: userId })

        if (!work) {
            throw new Error('Work not found or you do not have permission to delete it')
        }

        await Work.findByIdAndDelete(workId)
    } catch (error) {
        logger.error('Failed to delete work:', error)
        throw error
    }
}

export const applyToWork = async (workId: string, userId: string, message: string) => {
    try {
        const work = await Work.findById(workId)

        if (!work) {
            throw new Error('Work not found')
        }

        if (work.postedBy.toString() === userId) {
            throw new Error('You cannot apply to your own work')
        }

        // Check if user already applied
        const existingApplication = work.applicants.find(
            app => app.user?.toString() === userId
        )

        if (existingApplication) {
            throw new Error('You have already applied to this work')
        }

        work.applicants.push({
            user: new Types.ObjectId(userId),
            message,
            appliedAt: new Date(),
            status: 'pending'
        })

        await work.save()

        return await Work.findById(workId)
            .populate('postedBy', 'name userType')
            .populate('applicants.user', 'name userType')
    } catch (error) {
        logger.error('Failed to apply to work:', error)
        throw error
    }
}

export const getUserWorks = async (userId: string) => {
    try {
        const works = await Work.find({ postedBy: userId })
            .populate('applicants.user', 'name userType')
            .sort({ createdAt: -1 })

        return works
    } catch (error) {
        logger.error('Failed to get user works:', error)
        throw new Error('Failed to get user works')
    }
}

export const getAppliedWorks = async (userId: string) => {
    try {
        const works = await Work.find({ 'applicants.user': userId })
            .populate('postedBy', 'name userType')
            .sort({ createdAt: -1 })

        return works
    } catch (error) {
        logger.error('Failed to get applied works:', error)
        throw new Error('Failed to get applied works')
    }
}
