import mongoose, { Schema, Document } from 'mongoose'

export interface IAuditLog extends Document {
    actorId?: mongoose.Types.ObjectId
    entityType: 'user' | 'work' | 'message' | 'payment' | 'review' | 'notification' | 'system'
    entityId?: mongoose.Types.ObjectId
    action: string
    before?: Record<string, unknown>
    after?: Record<string, unknown>
    metadata?: Record<string, unknown>
    ip?: string
    userAgent?: string
    createdAt: Date
}

const AuditLogSchema = new Schema<IAuditLog>({
    actorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    action: { type: String, required: true, index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' })

AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 })
AuditLogSchema.index({ actorId: 1, createdAt: -1 })

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)
