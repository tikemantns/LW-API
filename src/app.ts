import express, { RequestHandler } from 'express'
import { json } from 'body-parser'
import swaggerUi from 'swagger-ui-express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import swaggerDocument from './config/swagger'
import authRoute from './routes/auth'
import userRoute from './routes/users'
import workRoute from './routes/works'
import messageRoute from './routes/messages'
import notificationRoute from './routes/notifications'
import paymentRoute from './routes/payments'
import reviewRoute from './routes/reviews'
import analyticsRoute from './routes/analytics'
import locationRoute from './routes/locations'
import performanceRoute from './routes/performance'
import errorHandler from './middleware/errorHandler'
import { applySecurityMiddleware } from './middleware/security'
import { verifyRequestSignature } from './middleware/requestSigner'
import { cacheMiddleware } from './middleware/cache'
import { performanceMetricsMiddleware, performanceMetricsHandler } from './middleware/performance'
import logger from './utils/logger'
import os from 'os'

const app = express()

// Trust proxy configuration for accurate IP detection behind load balancers/proxies
// This fixes the X-Forwarded-For header issue and enables proper rate limiting
if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'nonprod') {
    // In production, trust specific proxy hops (AWS ALB typically adds 1 hop)
    app.set('trust proxy', parseInt(process.env.TRUST_PROXY_HOPS || '1', 10))
} else {
    // In development/testing, trust all proxies for flexibility
    app.set('trust proxy', true)
}

// Performance monitoring - must be first middleware to capture accurate metrics
app.use(performanceMetricsMiddleware)

app.use(
    compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            const ua = req.headers['user-agent'] || ''
            if (/MSIE [1-6]\./.test(ua)) {
                return false
            }
            return compression.filter(req, res)
        },
    }) as unknown as RequestHandler
)

app.use(json({ limit: '10mb' }))
app.use(cookieParser())

const corsOptions = {
    origin:
        process.env.NODE_ENV === 'production'
            ? process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000'
            : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Request-Timestamp',
        'X-Request-Signature',
        'X-Client-Fingerprint',
    ],
    exposedHeaders: ['X-Rate-Limit', 'X-Auth-Token', 'X-Response-Time', 'X-Cache'],
    credentials: true,
    maxAge: 86400, // 24 hours
}
app.use(cors(corsOptions))

// Apply security middleware
applySecurityMiddleware(app)

app.use(verifyRequestSignature)

app.use(cacheMiddleware)

const swaggerOptions = {
    swaggerOptions: {
        validatorUrl: null,
        url: '/api/v1/lw/api-docs/swagger.json',
        oauth: { clientId: process.env.CLIENTID },
    },
    customCss: '.topbar-wrapper img { content: url(../Kmart-logo.png);}',
}

app.get('/api/v1/lw/api-docs/swagger.json', (req, res) => {
    res.json(swaggerDocument)
})

app.use(
    '/api/v1/lw/api-docs',
    swaggerUi.serve as unknown as RequestHandler,
    swaggerUi.setup(swaggerDocument, swaggerOptions) as unknown as RequestHandler
)

app.get('/healthcheck', (req, res) => {
    const systemInfo = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuLoad: os.loadavg(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
    }

    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Local Work API',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        system: systemInfo,
    })
})

// Performance metrics endpoint - available in development or with API key in production
app.get('/api/v1/lw/metrics', performanceMetricsHandler)

// New API routes
app.use('/api/v1/lw/auth', authRoute)
app.use('/api/v1/lw/users', userRoute)
app.use('/api/v1/lw/works', workRoute)
app.use('/api/v1/lw/messages', messageRoute)
app.use('/api/v1/lw/notifications', notificationRoute)
app.use('/api/v1/lw/payments', paymentRoute)
app.use('/api/v1/lw/reviews', reviewRoute)
app.use('/api/v1/lw/analytics', analyticsRoute)
app.use('/api/v1/lw/locations', locationRoute)

// Legacy route (deprecated)
// app.use('/api/v1/lw', lwRoute)
app.use('/api/v1/lw/performance', performanceRoute)

app.use((req, res, _next) => {
    logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl} from IP ${req.ip}`)
    res.status(404).json({
        success: false,
        error: 'The requested resource was not found',
    })
})

app.use(errorHandler)

export default app
