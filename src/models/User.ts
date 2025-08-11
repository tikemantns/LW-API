import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
    phoneNumber: string
    name?: string
    email?: string
    userType: 'worker' | 'work_provider'
    profilePhoto?: string
    location?: {
        latitude?: number
        longitude?: number
        pincode?: string
        address?: string
    }
    isVerified: boolean
    deviceTokens: Array<{
        token: string
        platform: 'android' | 'ios'
    }>
    savedLocations: Array<{
        name?: string
        pincode?: string
        latitude?: number
        longitude?: number
        address?: string
    }>
    // Enhanced user work portfolio and availability
    workPortfolio: {
        images: string[]  // Array of image URLs
        videos: string[]  // Array of video URLs
        skills: string[]  // Array of skills
        experience: string  // Experience description
        hourlyRate?: number  // For workers
        availableCategories?: string[]  // Categories they work in
    }
    availability: {
        status: 'available' | 'busy' | 'offline'
        schedule?: {
            monday?: { start: string, end: string, available: boolean }
            tuesday?: { start: string, end: string, available: boolean }
            wednesday?: { start: string, end: string, available: boolean }
            thursday?: { start: string, end: string, available: boolean }
            friday?: { start: string, end: string, available: boolean }
            saturday?: { start: string, end: string, available: boolean }
            sunday?: { start: string, end: string, available: boolean }
        }
        lastActive?: Date
    }
    premiumPlan: {
        type: 'basic' | 'premium' | 'enterprise'
        features: string[]
        expiresAt?: Date
        paymentStatus: 'active' | 'expired' | 'cancelled'
    }
    // App-specific fields for Local Work
    appSettings: {
        pushNotifications: boolean
        locationServices: boolean
        language: string
        theme: 'light' | 'dark'
    }
    statistics: {
        totalWorksCompleted: number
        totalWorksPosted: number
        averageRating: number
        totalEarnings: number
        responseTime: number  // in minutes
    }
    createdAt: Date
    updatedAt: Date
}

const UserSchema = new Schema<IUser>(
    {
        phoneNumber: { 
            type: String, 
            required: true, 
            unique: true,
            trim: true,
            index: true
        },
        name: { 
            type: String,
            trim: true,
            maxlength: 100
        },
        email: { 
            type: String,
            trim: true,
            lowercase: true,
            sparse: true,  // Allows multiple null values
            index: true
        },
        userType: { 
            type: String, 
            enum: ['worker', 'work_provider'], 
            required: true,
            index: true
        },
        profilePhoto: { 
            type: String,
            default: null
        },
        location: {
            latitude: { type: Number, min: -90, max: 90 },
            longitude: { type: Number, min: -180, max: 180 },
            pincode: { type: String, trim: true },
            address: { type: String, trim: true, maxlength: 500 }
        },
        isVerified: { 
            type: Boolean, 
            default: false,
            index: true
        },
        deviceTokens: [{
            token: { type: String, required: true },
            platform: { type: String, enum: ['android', 'ios'], required: true }
        }],
        savedLocations: [{
            name: { type: String, trim: true },
            pincode: { type: String, trim: true },
            latitude: { type: Number, min: -90, max: 90 },
            longitude: { type: Number, min: -180, max: 180 },
            address: { type: String, trim: true }
        }],
        // Enhanced work portfolio
        workPortfolio: {
            images: [{ type: String }],  // URLs to portfolio images
            videos: [{ type: String }],  // URLs to portfolio videos
            skills: [{ type: String, trim: true }],
            experience: { type: String, maxlength: 2000 },
            hourlyRate: { type: Number, min: 0 },
            availableCategories: [{ type: String, trim: true }]
        },
        // Enhanced availability system
        availability: {
            status: { 
                type: String, 
                enum: ['available', 'busy', 'offline'], 
                default: 'available',
                index: true
            },
            schedule: {
                monday: {
                    start: { type: String },
                    end: { type: String },
                    available: { type: Boolean, default: true }
                },
                tuesday: {
                    start: { type: String },
                    end: { type: String },
                    available: { type: Boolean, default: true }
                },
                wednesday: {
                    start: { type: String },
                    end: { type: String },
                    available: { type: Boolean, default: true }
                },
                thursday: {
                    start: { type: String },
                    end: { type: String },
                    available: { type: Boolean, default: true }
                },
                friday: {
                    start: { type: String },
                    end: { type: String },
                    available: { type: Boolean, default: true }
                },
                saturday: {
                    start: { type: String },
                    end: { type: String },
                    available: { type: Boolean, default: true }
                },
                sunday: {
                    start: { type: String },
                    end: { type: String },
                    available: { type: Boolean, default: true }
                }
            },
            lastActive: { type: Date, default: Date.now }
        },
        // Enhanced premium plan system
        premiumPlan: {
            type: { 
                type: String, 
                enum: ['basic', 'premium', 'enterprise'], 
                default: 'basic',
                index: true
            },
            features: [{ type: String }],
            expiresAt: { type: Date },
            paymentStatus: { 
                type: String, 
                enum: ['active', 'expired', 'cancelled'], 
                default: 'active' 
            }
        },
        // App-specific settings for Local Work React Native app
        appSettings: {
            pushNotifications: { type: Boolean, default: true },
            locationServices: { type: Boolean, default: true },
            language: { type: String, default: 'en' },
            theme: { type: String, enum: ['light', 'dark'], default: 'light' }
        },
        // User statistics for the app
        statistics: {
            totalWorksCompleted: { type: Number, default: 0 },
            totalWorksPosted: { type: Number, default: 0 },
            averageRating: { type: Number, default: 0, min: 0, max: 5 },
            totalEarnings: { type: Number, default: 0, min: 0 },
            responseTime: { type: Number, default: 0, min: 0 }  // in minutes
        }
    },
    {
        timestamps: true,
        collection: 'users'
    }
)

// Indexes for better performance
UserSchema.index({ phoneNumber: 1 })
UserSchema.index({ email: 1 })
UserSchema.index({ userType: 1 })
UserSchema.index({ 'location.latitude': 1, 'location.longitude': 1 })
UserSchema.index({ 'availability.status': 1 })
UserSchema.index({ 'premiumPlan.type': 1 })
UserSchema.index({ isVerified: 1 })
UserSchema.index({ createdAt: -1 })

// Virtual for full name if needed
UserSchema.virtual('isWorker').get(function() {
    return this.userType === 'worker'
})

UserSchema.virtual('isWorkProvider').get(function() {
    return this.userType === 'work_provider'
})

// Methods
UserSchema.methods.updateLastActive = function() {
    this.availability.lastActive = new Date()
    return this.save()
}

UserSchema.methods.updateAvailabilityStatus = function(status: 'available' | 'busy' | 'offline') {
    this.availability.status = status
    this.availability.lastActive = new Date()
    return this.save()
}

export const User = mongoose.model<IUser>('User', UserSchema)
