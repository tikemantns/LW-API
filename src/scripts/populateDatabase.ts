import mongoose from 'mongoose';
import { User } from '../models/User';
import { Work } from '../models/Work';
import { Review } from '../models/Review';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { Notification } from '../models/Notification';
import { Payment } from '../models/Payment';
import { Analytics } from '../models/Analytics';

// Configuration data to store in DB
const configData = {
    app: {
        name: 'LocalWork',
        version: '1.0.0',
        supportedLanguages: ['en', 'es', 'fr'],
        defaultLanguage: 'en',
        theme: {
            primary: '#007AFF',
            secondary: '#34C759',
            accent: '#FF9500',
            background: '#F2F2F7',
            surface: '#FFFFFF',
            text: '#000000'
        }
    },
    business: {
        commissionRate: 0.15, // 15% commission
        serviceRadius: 50, // 50km default radius
        paymentMethods: ['card', 'paypal', 'bank_transfer'],
        workCategories: [
            'construction', 'cleaning', 'plumbing', 'electrical', 'gardening',
            'painting', 'moving', 'handyman', 'cooking', 'delivery',
            'tutoring', 'petcare', 'childcare', 'eldercare', 'technology', 'automotive'
        ],
        emergencyCategories: ['plumbing', 'electrical', 'automotive'],
        premiumFeatures: ['priority_listing', 'advanced_analytics', 'customer_support']
    },
    notifications: {
        types: ['work_posted', 'application_received', 'work_assigned', 'payment_received', 'review_received'],
        deliveryMethods: ['push', 'email', 'sms'],
        defaultSettings: {
            workUpdates: true,
            paymentAlerts: true,
            marketingEmails: false,
            smsNotifications: true
        }
    },
    location: {
        defaultCountry: 'US',
        supportedCountries: ['US', 'CA', 'MX', 'UK', 'DE', 'FR', 'ES', 'IT', 'AU'],
        geocodingProvider: 'google',
        mapProvider: 'google'
    }
};

// Create dummy users
const createUsers = async () => {
    const users = [
        {
            name: 'John Smith',
            email: 'john.smith@example.com',
            phoneNumber: '+1234567890',
            userType: 'worker',
            isVerified: true,
            location: {
                latitude: 40.7128,
                longitude: -74.0060,
                address: '123 Broadway, New York, NY 10001',
                pincode: '10001'
            },
            workPortfolio: {
                skills: ['plumbing', 'electrical', 'handyman'],
                experience: 5,
                hourlyRate: 45,
                description: 'Experienced plumber and electrician with 5 years of experience.',
                images: ['https://example.com/portfolio1.jpg'],
                videos: [],
                availableCategories: ['plumbing', 'electrical', 'handyman']
            },
            availability: {
                status: 'available',
                schedule: {
                    monday: { available: true, start: '08:00', end: '18:00' },
                    tuesday: { available: true, start: '08:00', end: '18:00' },
                    wednesday: { available: true, start: '08:00', end: '18:00' },
                    thursday: { available: true, start: '08:00', end: '18:00' },
                    friday: { available: true, start: '08:00', end: '18:00' },
                    saturday: { available: true, start: '09:00', end: '15:00' },
                    sunday: { available: false, start: '', end: '' }
                }
            },
            statistics: {
                totalWorksCompleted: 45,
                averageRating: 4.8,
                totalEarnings: 12500,
                responseTime: 15
            }
        },
        {
            name: 'Maria Garcia',
            email: 'maria.garcia@example.com',
            phoneNumber: '+1234567891',
            userType: 'worker',
            isVerified: true,
            location: {
                latitude: 40.7589,
                longitude: -73.9851,
                address: '456 Park Ave, New York, NY 10016',
                pincode: '10016'
            },
            workPortfolio: {
                skills: ['cleaning', 'childcare', 'eldercare'],
                experience: 3,
                hourlyRate: 25,
                description: 'Professional cleaner and caregiver with excellent references.',
                images: ['https://example.com/portfolio2.jpg'],
                videos: [],
                availableCategories: ['cleaning', 'childcare', 'eldercare']
            },
            availability: {
                status: 'available',
                schedule: {
                    monday: { available: true, start: '07:00', end: '19:00' },
                    tuesday: { available: true, start: '07:00', end: '19:00' },
                    wednesday: { available: true, start: '07:00', end: '19:00' },
                    thursday: { available: true, start: '07:00', end: '19:00' },
                    friday: { available: true, start: '07:00', end: '19:00' },
                    saturday: { available: true, start: '08:00', end: '16:00' },
                    sunday: { available: false, start: '', end: '' }
                }
            },
            statistics: {
                totalWorksCompleted: 32,
                averageRating: 4.9,
                totalEarnings: 8500,
                responseTime: 12
            }
        },
        {
            name: 'Robert Johnson',
            email: 'robert.johnson@example.com',
            phoneNumber: '+1234567892',
            userType: 'work_provider',
            isVerified: true,
            location: {
                latitude: 40.7282,
                longitude: -73.7949,
                address: '789 Queens Blvd, Queens, NY 11373',
                pincode: '11373'
            },
            statistics: {
                totalWorksPosted: 12,
                averageRating: 4.7,
                totalEarnings: 0,
                responseTime: 25
            }
        },
        {
            name: 'Lisa Davis',
            email: 'lisa.davis@example.com',
            phoneNumber: '+1234567893',
            userType: 'work_provider',
            isVerified: true,
            location: {
                latitude: 40.6892,
                longitude: -74.0445,
                address: '321 Brooklyn Ave, Brooklyn, NY 11201',
                pincode: '11201'
            },
            statistics: {
                totalWorksPosted: 8,
                averageRating: 4.6,
                totalEarnings: 0,
                responseTime: 30
            }
        }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
};

// Create dummy works
const createWorks = async (users: any[]) => {
    const clients = users.filter(u => u.userType === 'work_provider');
    const workers = users.filter(u => u.userType === 'worker');

    const works = [
        {
            title: 'Fix Kitchen Sink Leak',
            description: 'Kitchen sink has been leaking for a few days. Need a plumber to fix it urgently.',
            category: 'plumbing',
            location: 'Queens, NY',
            coordinates: {
                latitude: 40.7282,
                longitude: -73.7949
            },
            pay: {
                type: 'fixed',
                amount: 150,
                currency: 'USD'
            },
            duration: {
                type: 'hours',
                value: 3,
                flexible: false
            },
            urgency: 'high',
            requirements: ['Licensed plumber', 'Own tools', 'Available weekends'],
            workType: 'immediate',
            postedBy: clients[0]._id,
            status: 'completed',
            selectedWorker: workers[0]._id,
            applicants: [
                {
                    user: workers[0]._id,
                    message: 'I can fix this today. I have 5 years of plumbing experience.',
                    appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    status: 'accepted'
                }
            ]
        },
        {
            title: 'House Cleaning Service',
            description: 'Need weekly house cleaning for a 3-bedroom apartment. Looking for reliable cleaner.',
            category: 'cleaning',
            location: 'Brooklyn, NY',
            coordinates: {
                latitude: 40.6892,
                longitude: -74.0445
            },
            pay: {
                type: 'hourly',
                amount: 25,
                currency: 'USD'
            },
            duration: {
                type: 'hours',
                value: 4,
                flexible: true
            },
            urgency: 'medium',
            requirements: ['Own cleaning supplies', 'Experience with deep cleaning', 'Weekly availability'],
            workType: 'recurring',
            postedBy: clients[1]._id,
            status: 'in_progress',
            selectedWorker: workers[1]._id,
            applicants: [
                {
                    user: workers[1]._id,
                    message: 'I provide professional cleaning services with my own supplies.',
                    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                    status: 'accepted'
                }
            ]
        },
        {
            title: 'Electrical Outlet Installation',
            description: 'Need to install 3 new electrical outlets in the living room.',
            category: 'electrical',
            location: 'Manhattan, NY',
            coordinates: {
                latitude: 40.7589,
                longitude: -73.9851
            },
            pay: {
                type: 'fixed',
                amount: 200,
                currency: 'USD'
            },
            duration: {
                type: 'hours',
                value: 3,
                flexible: false
            },
            urgency: 'medium',
            requirements: ['Licensed electrician', 'Insurance required', 'Same day service'],
            workType: 'scheduled',
            postedBy: clients[0]._id,
            status: 'active',
            applicants: [
                {
                    user: workers[0]._id,
                    message: 'Licensed electrician, can do this tomorrow morning.',
                    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    status: 'pending'
                }
            ]
        },
        {
            title: 'Moving Help Needed',
            description: 'Need help moving furniture from 2nd floor apartment to moving truck.',
            category: 'moving',
            location: 'Queens, NY',
            coordinates: {
                latitude: 40.7282,
                longitude: -73.7949
            },
            pay: {
                type: 'hourly',
                amount: 30,
                currency: 'USD'
            },
            duration: {
                type: 'hours',
                value: 5,
                flexible: true
            },
            urgency: 'high',
            requirements: ['Physically fit', 'Moving experience', 'Available this weekend'],
            workType: 'immediate',
            postedBy: clients[1]._id,
            status: 'active',
            applicants: []
        }
    ];

    const createdWorks = await Work.insertMany(works);
    console.log(`✅ Created ${createdWorks.length} works`);
    return createdWorks;
};

// Create dummy reviews
const createReviews = async (users: any[], works: any[]) => {
    const reviews = [
        {
            workId: works[0]._id,
            reviewerId: users.find(u => u.userType === 'work_provider')._id,
            revieweeId: users.find(u => u.userType === 'worker')._id,
            rating: 5,
            comment: 'Excellent work! Fixed the leak quickly and professionally.',
            reviewType: 'worker_review'
        },
        {
            workId: works[1]._id,
            reviewerId: users.find(u => u.userType === 'work_provider' && u.email === 'lisa.davis@example.com')._id,
            revieweeId: users.find(u => u.userType === 'worker' && u.email === 'maria.garcia@example.com')._id,
            rating: 5,
            comment: 'Amazing cleaning service! Very thorough and reliable.',
            reviewType: 'worker_review'
        }
    ];

    const createdReviews = await Review.insertMany(reviews);
    console.log(`✅ Created ${createdReviews.length} reviews`);
    return createdReviews;
};

// Create dummy conversations and messages
const createMessages = async (users: any[], works: any[]) => {
    const client = users.find(u => u.userType === 'work_provider');
    const worker = users.find(u => u.userType === 'worker');

    // Create conversation
    const conversation = await Conversation.create({
        workId: works[0]._id,
        participants: [client._id, worker._id],
        conversationType: 'work_chat',
        isActive: true,
        lastMessageAt: new Date()
    });

    // Create messages
    const messages = [
        {
            conversationId: conversation._id,
            sender: client._id,
            recipient: worker._id,
            workId: works[0]._id,
            content: 'Hi, I saw your application for the plumbing job. When can you start?',
            messageType: 'text'
        },
        {
            conversationId: conversation._id,
            sender: worker._id,
            recipient: client._id,
            workId: works[0]._id,
            content: 'Hello! I can start tomorrow morning around 9 AM if that works for you.',
            messageType: 'text'
        },
        {
            conversationId: conversation._id,
            sender: client._id,
            recipient: worker._id,
            workId: works[0]._id,
            content: 'Perfect! See you tomorrow at 9 AM. The address is 789 Queens Blvd.',
            messageType: 'text'
        }
    ];

    const createdMessages = await Message.insertMany(messages);
    console.log(`✅ Created ${createdMessages.length} messages`);
    
    return { conversation, messages: createdMessages };
};

// Create dummy notifications
const createNotifications = async (users: any[], works: any[]) => {
    const notifications = [
        {
            userId: users.find(u => u.userType === 'worker')._id,
            type: 'work_application_accepted',
            title: 'Application Accepted!',
            body: 'Your application for "Fix Kitchen Sink Leak" has been accepted.',
            relatedId: works[0]._id,
            read: false,
            priority: 'high'
        },
        {
            userId: users.find(u => u.userType === 'work_provider')._id,
            type: 'work_completed',
            title: 'Work Completed',
            body: 'The plumbing work has been marked as completed.',
            relatedId: works[0]._id,
            read: true,
            priority: 'medium'
        },
        {
            userId: users.find(u => u.userType === 'worker' && u.email === 'maria.garcia@example.com')._id,
            type: 'new_work_nearby',
            title: 'New Work Nearby',
            body: 'A new cleaning job is available in your area.',
            relatedId: works[1]._id,
            read: false,
            priority: 'medium'
        }
    ];

    const createdNotifications = await Notification.insertMany(notifications);
    console.log(`✅ Created ${createdNotifications.length} notifications`);
    return createdNotifications;
};

// Create dummy payments
const createPayments = async (users: any[], works: any[]) => {
    const payments = [
        {
            workId: works[0]._id,
            payerId: users.find(u => u.userType === 'work_provider')._id,
            payeeId: users.find(u => u.userType === 'worker')._id,
            amount: 150,
            currency: 'USD',
            paymentMethod: 'card',
            status: 'completed',
            transactionId: 'txn_' + Date.now(),
            platformFee: 22.5, // 15% of 150
            workerAmount: 127.5
        },
        {
            workId: works[1]._id,
            payerId: users.find(u => u.userType === 'work_provider' && u.email === 'lisa.davis@example.com')._id,
            payeeId: users.find(u => u.userType === 'worker' && u.email === 'maria.garcia@example.com')._id,
            amount: 100,
            currency: 'USD',
            paymentMethod: 'paypal',
            status: 'pending',
            platformFee: 15, // 15% of 100
            workerAmount: 85
        }
    ];

    const createdPayments = await Payment.insertMany(payments);
    console.log(`✅ Created ${createdPayments.length} payments`);
    return createdPayments;
};

// Create dummy analytics
const createAnalytics = async (users: any[], works: any[]) => {
    const analytics = [
        {
            userId: users.find(u => u.userType === 'worker')._id,
            event: 'profile_view',
            workId: works[0]._id,
            sessionId: 'session_' + Date.now(),
            platform: 'mobile',
            appVersion: '1.0.0',
            location: {
                country: 'US',
                state: 'NY',
                city: 'New York'
            }
        },
        {
            userId: users.find(u => u.userType === 'work_provider')._id,
            event: 'work_posted',
            workId: works[0]._id,
            sessionId: 'session_' + (Date.now() + 1),
            platform: 'mobile',
            appVersion: '1.0.0',
            location: {
                country: 'US',
                state: 'NY',
                city: 'Queens'
            }
        }
    ];

    const createdAnalytics = await Analytics.insertMany(analytics);
    console.log(`✅ Created ${createdAnalytics.length} analytics records`);
    return createdAnalytics;
};

// Main function to populate database
export const populateDatabase = async () => {
    try {
        console.log('🚀 Starting database population...');
        
        // Check if data already exists
        const existingUsers = await User.countDocuments();
        if (existingUsers > 0) {
            console.log('📊 Database already has data. Skipping population.');
            return;
        }

        // Create all dummy data
        const users = await createUsers();
        const works = await createWorks(users);
        const reviews = await createReviews(users, works);
        const messageData = await createMessages(users, works);
        const notifications = await createNotifications(users, works);
        const payments = await createPayments(users, works);
        const analytics = await createAnalytics(users, works);

        // Store configuration in a special collection
        const ConfigModel = mongoose.model('Config', new mongoose.Schema({
            key: { type: String, unique: true },
            value: mongoose.Schema.Types.Mixed,
            updatedAt: { type: Date, default: Date.now }
        }));

        await ConfigModel.create({
            key: 'app_config',
            value: configData
        });

        console.log('✅ Configuration stored in database');
        console.log('🎉 Database population completed successfully!');
        
        console.log(`
📊 SUMMARY:
- Users: ${users.length}
- Works: ${works.length}
- Reviews: ${reviews.length}
- Messages: ${messageData.messages.length}
- Notifications: ${notifications.length}
- Payments: ${payments.length}
- Analytics: ${analytics.length}
- Configuration: Stored
        `);

    } catch (error) {
        console.error('❌ Error populating database:', error);
        throw error;
    }
};

// Run if called directly
if (require.main === module) {
    mongoose.connect('mongodb://localhost:27017/localworkDB')
        .then(() => {
            console.log('Connected to MongoDB');
            return populateDatabase();
        })
        .then(() => {
            console.log('Population complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error:', error);
            process.exit(1);
        });
}
