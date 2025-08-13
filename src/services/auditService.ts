import { AuditLog } from '../models/AuditLog'

export const logChange = async (params: {
    actorId?: string
    entityType: 'user' | 'work' | 'message' | 'payment' | 'review' | 'notification' | 'system'
    entityId?: string
    action: string
    before?: Record<string, unknown>
    after?: Record<string, unknown>
    metadata?: Record<string, unknown>
    ip?: string
    userAgent?: string
}) => {
    try {
        await AuditLog.create({
            ...params,
            actorId: params.actorId,
            entityId: params.entityId
        })
    } catch (e) {
        // Do not throw to avoid breaking business flows
        // eslint-disable-next-line no-console
        console.warn('Audit log failed:', e)
    }
}
