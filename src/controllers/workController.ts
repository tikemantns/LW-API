import { Request, Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import { ApiResponse } from '../types'
import * as workService from '../services/workService'
import logger from '../utils/logger'

export const getWorks = async (req: Request, res: Response) => {
    try {
        const { category, location, radius, page = 1, limit = 10, sortBy } = req.query

        const works = await workService.getWorks({
            category: category as string,
            location: location as string,
            radius: radius ? Number(radius) : undefined,
            page: Number(page),
            limit: Number(limit),
            sortBy: sortBy as string
        })

        const response: ApiResponse = {
            success: true,
            data: works
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get works:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get works'
        })
    }
}

export const createWork = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const workData = {
            ...req.body,
            postedBy: req.user.userId
        }

        const work = await workService.createWork(workData)

        const response: ApiResponse = {
            success: true,
            data: work,
            message: 'Work posted successfully'
        }

        res.status(201).json(response)
    } catch (error) {
        logger.error('Failed to create work:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to create work'
        })
    }
}

export const getWorkById = async (req: Request, res: Response) => {
    try {
        const { workId } = req.params
        const work = await workService.getWorkById(workId)

        if (!work) {
            return res.status(404).json({
                success: false,
                error: 'Work not found'
            })
        }

        const response: ApiResponse = {
            success: true,
            data: work
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get work:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get work'
        })
    }
}

export const updateWork = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { workId } = req.params
        const work = await workService.updateWork(workId, req.user.userId, req.body)

        const response: ApiResponse = {
            success: true,
            data: work,
            message: 'Work updated successfully'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to update work:', error)
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500
        res.status(statusCode).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update work'
        })
    }
}

export const deleteWork = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { workId } = req.params
        await workService.deleteWork(workId, req.user.userId)

        res.status(200).json({
            success: true,
            message: 'Work deleted successfully'
        })
    } catch (error) {
        logger.error('Failed to delete work:', error)
        const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500
        res.status(statusCode).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete work'
        })
    }
}

export const applyToWork = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { workId } = req.params
        const { message } = req.body

        const work = await workService.applyToWork(workId, req.user.userId, message)

        const response: ApiResponse = {
            success: true,
            data: work,
            message: 'Application submitted successfully'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to apply to work:', error)
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to apply to work'
        })
    }
}

export const getMyWorks = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const works = await workService.getUserWorks(req.user.userId)

        const response: ApiResponse = {
            success: true,
            data: works
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get user works:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get user works'
        })
    }
}

export const getAppliedWorks = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const works = await workService.getAppliedWorks(req.user.userId)

        const response: ApiResponse = {
            success: true,
            data: works
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get applied works:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get applied works'
        })
    }
}
