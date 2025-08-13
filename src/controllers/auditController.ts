import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import { AuditLog } from '../models/AuditLog'

export const listAuditLogs = async (req: JWTAuthRequest, res: Response) => {
    try {
        const { entityType, entityId, actorId, page = '1', limit = '20' } = req.query as Record<string, string>
        const query: Record<string, unknown> = {}
        if (entityType) query.entityType = entityType
        if (entityId) query.entityId = entityId
        if (actorId) query.actorId = actorId

        const p = Math.max(parseInt(page as string, 10) || 1, 1)
        const l = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100)

        const [items, total] = await Promise.all([
            AuditLog.find(query).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
            AuditLog.countDocuments(query)
        ])

        res.json({
            success: true,
            data: { items },
            pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
        })
    } catch (e) {
        res.status(500).json({ success: false, error: 'Failed to fetch audit logs' })
    }
}
