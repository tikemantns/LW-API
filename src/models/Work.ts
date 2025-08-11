import mongoose, { Schema, Document } from 'mongoose'

export interface IWork extends Document {
    title: string
    description: string
    category: string
    location: string
    coordinates?: {
        latitude: number
        longitude: number
    }
    pay: {
        amount: number
        type: 'hourly' | 'fixed' | 'daily'
        currency: string
    }
    duration: {
        type: 'hours' | 'days' | 'weeks' | 'months'
        value: number
        flexible: boolean
    }
    requirements: string[]
    skills: string[]
    urgency: 'low' | 'medium' | 'high' | 'urgent'
    status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
    postedBy: mongoose.Types.ObjectId
    applicants: Array<{
        user: mongoose.Types.ObjectId
        message?: string
        appliedAt: Date
        status: 'pending' | 'accepted' | 'rejected'
        proposedRate?: number
    }>
    selectedWorker?: mongoose.Types.ObjectId
    workImages?: string[]  // Images related to the work
    startDate?: Date
    endDate?: Date
    actualStartDate?: Date
    actualEndDate?: Date
    workProgress?: {
        percentage: number
        milestones: Array<{
            title: string
            description?: string
            completed: boolean
            completedAt?: Date
        }>
    }
    // Local Work app specific fields
    workType: 'immediate' | 'scheduled' | 'recurring'
    recurringPattern?: {
        frequency: 'daily' | 'weekly' | 'monthly'
        days?: string[]  // For weekly: ['monday', 'friday']
        endDate?: Date
    }
    workVerification?: {
        beforeImages: string[]
        afterImages: string[]
        verificationRequired: boolean
        verifiedBy?: mongoose.Types.ObjectId
        verifiedAt?: Date
    }
    createdAt: Date
    updatedAt: Date
}

const WorkSchema = new Schema<IWork>(
    {
        title: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 200,
            index: 'text'
        },
        description: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 2000,
            index: 'text'
        },
        category: { 
            type: String, 
            required: true,
            trim: true,
            index: true
        },
        location: { 
            type: String, 
            required: true,
            trim: true,
            index: true
        },
        coordinates: {
            latitude: { type: Number, min: -90, max: 90 },
            longitude: { type: Number, min: -180, max: 180 }
        },
        pay: {
            amount: { type: Number, required: true, min: 0 },
            type: { 
                type: String, 
                enum: ['hourly', 'fixed', 'daily'], 
                required: true,
                default: 'fixed'
            },
            currency: { type: String, default: 'INR' }
        },
        duration: {
            type: { 
                type: String, 
                enum: ['hours', 'days', 'weeks', 'months'], 
                required: true 
            },
            value: { type: Number, required: true, min: 1 },
            flexible: { type: Boolean, default: false }
        },
        requirements: [{ 
            type: String, 
            trim: true,
            maxlength: 200
        }],
        skills: [{ 
            type: String, 
            trim: true,
            maxlength: 50
        }],
        urgency: { 
            type: String, 
            enum: ['low', 'medium', 'high', 'urgent'], 
            default: 'medium',
            index: true
        },
        status: { 
            type: String, 
            enum: ['draft', 'active', 'in_progress', 'completed', 'cancelled'], 
            default: 'draft',
            index: true
        },
        postedBy: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        applicants: [{
            user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            message: { type: String, trim: true, maxlength: 500 },
            appliedAt: { type: Date, default: Date.now },
            status: { 
                type: String, 
                enum: ['pending', 'accepted', 'rejected'], 
                default: 'pending' 
            },
            proposedRate: { type: Number, min: 0 }
        }],
        selectedWorker: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            index: true
        },
        workImages: [{ type: String }],  // URLs to work-related images
        startDate: { type: Date },
        endDate: { type: Date },
        actualStartDate: { type: Date },
        actualEndDate: { type: Date },
        workProgress: {
            percentage: { type: Number, min: 0, max: 100, default: 0 },
            milestones: [{
                title: { type: String, required: true, trim: true },
                description: { type: String, trim: true },
                completed: { type: Boolean, default: false },
                completedAt: { type: Date }
            }]
        },
        // Local Work app specific enhancements
        workType: { 
            type: String, 
            enum: ['immediate', 'scheduled', 'recurring'], 
            default: 'scheduled',
            index: true
        },
        recurringPattern: {
            frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
            days: [{ type: String }],  // ['monday', 'wednesday', 'friday']
            endDate: { type: Date }
        },
        workVerification: {
            beforeImages: [{ type: String }],
            afterImages: [{ type: String }],
            verificationRequired: { type: Boolean, default: false },
            verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            verifiedAt: { type: Date }
        }
    },
    {
        timestamps: true,
        collection: 'works'
    }
)

// Indexes for better performance
WorkSchema.index({ category: 1, status: 1 })
WorkSchema.index({ location: 1, status: 1 })
WorkSchema.index({ status: 1, urgency: 1 })
WorkSchema.index({ postedBy: 1, status: 1 })
WorkSchema.index({ selectedWorker: 1 })
WorkSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 })
WorkSchema.index({ createdAt: -1 })
WorkSchema.index({ workType: 1 })
WorkSchema.index({ 'pay.amount': 1 })

// Text search index
WorkSchema.index({ 
    title: 'text', 
    description: 'text', 
    category: 'text',
    location: 'text'
})

// Virtual fields
WorkSchema.virtual('applicantCount').get(function() {
    return this.applicants.length
})

WorkSchema.virtual('isActive').get(function() {
    return this.status === 'active'
})

WorkSchema.virtual('isCompleted').get(function() {
    return this.status === 'completed'
})

// Methods
WorkSchema.methods.addApplicant = function(userId: mongoose.Types.ObjectId, message?: string, proposedRate?: number) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingApplicant = this.applicants.find((app: any) => app.user.toString() === userId.toString())
    if (existingApplicant) {
        throw new Error('User has already applied for this work')
    }
    
    this.applicants.push({
        user: userId,
        message,
        appliedAt: new Date(),
        status: 'pending',
        proposedRate
    })
    
    return this.save()
}

WorkSchema.methods.updateProgress = function(percentage: number) {
    this.workProgress = this.workProgress || { percentage: 0, milestones: [] }
    this.workProgress.percentage = Math.min(100, Math.max(0, percentage))
    return this.save()
}

export const Work = mongoose.model<IWork>('Work', WorkSchema)
