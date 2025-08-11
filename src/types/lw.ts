import { Document } from 'mongoose'

export interface ExternalReference {
    id?: string
    source?: string
}

export interface IdName {
    _id?: string
    name?: string
}

export interface Material {
    _id?: any
    setAttribute?: IdName
    materialType?: string
    materialOption?: IdName
    garmentComponent?: string
    fabricSustainability?: IdName[]
}

export interface BillOfMaterial {
    id?: string
    description?: string
    materialOptions?: IdName[]
    fabricSustainabilities?: IdName[]
    materials?: Material[]
}

export interface LWAttribute {
    productCode?: string
    productId?: string
    productDescription?: string
    yearRegistered?: number
    season?: IdName
    department?: IdName
    overseasStockBuffering?: boolean
    sourcingAttribute1?: string
    sourcingAttribute2?: string
}

export interface LW extends Document {
    externalReferences?: ExternalReference[]
    lwCode?: string
    colourName?: string
    optionId?: string
    lwAttribute?: LWAttribute
    boms?: BillOfMaterial[]
    createdAt: Date
    updatedAt: Date
}

export interface LWQuery {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    lwCode?: string
    colourName?: string
    productCode?: string
    department?: string
    search?: string
    externalRefId?: string
    externalRefSource?: string
}

export interface LWType extends LW {}

// User types
export interface User extends Document {
    phoneNumber: string
    name: string
    email?: string
    userType: 'worker' | 'work_provider'
    profilePhoto?: string
    location?: {
        latitude: number
        longitude: number
        address: string
    }
    isVerified: boolean
    deviceTokens: Array<{
        token: string
        platform: 'android' | 'ios'
    }>
    savedLocations: Array<{
        name: string
        latitude: number
        longitude: number
        address: string
    }>
    createdAt: Date
    updatedAt: Date
}

export interface Work extends Document {
    title: string
    description: string
    category: string
    location: string
    coordinates?: {
        latitude: number
        longitude: number
    }
    pay: string
    duration: string
    requirements: string[]
    status: 'active' | 'in_progress' | 'completed' | 'cancelled'
    postedBy: string
    applicants: Array<{
        user: string
        message: string
        appliedAt: Date
        status: 'pending' | 'accepted' | 'rejected'
    }>
    selectedWorker?: string
    startDate?: Date
    endDate?: Date
    createdAt: Date
    updatedAt: Date
}

export interface Message extends Document {
    conversationId: string
    sender: string
    recipient: string
    message: string
    workId?: string
    readAt?: Date
    messageType: 'text' | 'image' | 'file'
    createdAt: Date
    updatedAt: Date
}

export interface Conversation extends Document {
    participants: string[]
    workId?: string
    lastMessage?: string
    lastMessageAt?: Date
    unreadCount?: Map<string, number>
    createdAt: Date
    updatedAt: Date
}

export interface Notification extends Document {
    userId: string
    title: string
    message: string
    type: 'work_application' | 'work_accepted' | 'work_completed' | 'message' | 'payment'
    relatedId?: string
    read: boolean
    data?: any
    createdAt: Date
    updatedAt: Date
}

export interface Payment extends Document {
    workId: string
    payerId: string
    payeeId: string
    amount: number
    status: 'pending' | 'completed' | 'failed' | 'refunded'
    paymentMethod?: string
    transactionId?: string
    platformFee: number
    createdAt: Date
    updatedAt: Date
}

export interface Review extends Document {
    workId: string
    reviewerId: string
    revieweeId: string
    rating: number
    comment?: string
    reviewType: 'worker_review' | 'employer_review'
    createdAt: Date
    updatedAt: Date
}

export interface Analytics extends Document {
    userId?: string
    event: string
    workId?: string
    data?: any
    sessionId?: string
    userAgent?: string
    ipAddress?: string
    createdAt: Date
    updatedAt: Date
}
