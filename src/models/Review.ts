import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
    workId: mongoose.Types.ObjectId
    reviewerId: mongoose.Types.ObjectId  // Who is giving the review
    revieweeId: mongoose.Types.ObjectId  // Who is being reviewed
    rating: number  // 1-5 stars
    comment?: string
    reviewType: 'worker_review' | 'employer_review'
    reviewCategories?: {
        communication?: number  // 1-5
        quality?: number       // 1-5
        timeliness?: number    // 1-5
        professionalism?: number // 1-5
        overall?: number       // 1-5
    }
    helpful: number  // Count of helpful votes
    reported: boolean
    verified: boolean  // Verified that work actually happened
    response?: {  // Response from the reviewed person
        message: string
        respondedAt: Date
    }
    createdAt: Date
    updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
    {
        workId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Work', 
            required: true,
            index: true
        },
        reviewerId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        revieweeId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        rating: { 
            type: Number, 
            min: 1, 
            max: 5, 
            required: true,
            index: true
        },
        comment: { 
            type: String,
            trim: true,
            maxlength: 1000
        },
        reviewType: { 
            type: String, 
            enum: ['worker_review', 'employer_review'], 
            required: true,
            index: true
        },
        reviewCategories: {
            communication: { type: Number, min: 1, max: 5 },
            quality: { type: Number, min: 1, max: 5 },
            timeliness: { type: Number, min: 1, max: 5 },
            professionalism: { type: Number, min: 1, max: 5 },
            overall: { type: Number, min: 1, max: 5 }
        },
        helpful: {
            type: Number,
            default: 0,
            min: 0
        },
        reported: {
            type: Boolean,
            default: false,
            index: true
        },
        verified: {
            type: Boolean,
            default: false,
            index: true
        },
        response: {
            message: { type: String, trim: true, maxlength: 500 },
            respondedAt: { type: Date }
        }
    },
    {
        timestamps: true,
        collection: 'reviews'
    }
)

// Indexes
ReviewSchema.index({ workId: 1, reviewType: 1 })
ReviewSchema.index({ reviewerId: 1, createdAt: -1 })
ReviewSchema.index({ revieweeId: 1, rating: 1 })
ReviewSchema.index({ reviewType: 1, rating: 1 })
ReviewSchema.index({ verified: 1, rating: 1 })

// Compound index to prevent duplicate reviews
ReviewSchema.index({ workId: 1, reviewerId: 1, reviewType: 1 }, { unique: true })

// Virtual fields
ReviewSchema.virtual('averageRating').get(function() {
    if (!this.reviewCategories) return this.rating
    
    const categories = this.reviewCategories
    const ratings = [
        categories.communication,
        categories.quality,
        categories.timeliness,
        categories.professionalism
    ].filter(rating => rating !== undefined) as number[]
    
    if (ratings.length === 0) return this.rating
    
    const sum = ratings.reduce((total, rating) => total + rating, 0)
    return Number((sum / ratings.length).toFixed(1))
})

// Methods
ReviewSchema.methods.addResponse = function(message: string) {
    this.response = {
        message,
        respondedAt: new Date()
    }
    return this.save()
}

ReviewSchema.methods.markHelpful = function() {
    this.helpful += 1
    return this.save()
}

export const Review = mongoose.model<IReview>('Review', ReviewSchema)
