# Product Spec Service

This project provides a RESTful API for managing product specifications with AWS Lambda event publishing.

## Project Structure

```
sourcing-product-spec/
├── services/
│   └── product-spec-service/
│       └── src/                    # All source files are in src/ directory
│           ├── app.ts              # Express application setup with middleware initialization
│           ├── server.ts           # Server entry point with AWS SSM and cache initialization
│           ├── package.json        # Dependencies and scripts
│           ├── tsconfig.json       # TypeScript configuration
│           ├── jest.config.js      # Jest testing configuration
│           ├── .eslintrc           # ESLint configuration
│           ├── .prettierrc         # Prettier configuration
│           ├── .env.dev            # Development environment variables
│           ├── .env.nonprod        # Non-production environment variables
│           ├── routes/             # API route definitions
│           │   ├── productSpecs.ts # Product specification CRUD operations
│           │   └── performance.ts  # Performance monitoring and cache management routes
│           ├── middleware/         # Application middleware
│           │   ├── auth.ts         # JWT authentication and authorization
│           │   ├── cache.ts        # In-memory response caching middleware
│           │   ├── errorHandler.ts # Centralized error handling
│           │   ├── performance.ts  # Performance tracking and metrics
│           │   ├── requestSigner.ts# Request signature verification
│           │   ├── security.ts     # Security headers and protection
│           │   └── validation.ts   # Request validation using Joi schemas
│           ├── controllers/        # Business logic controllers
│           │   └── productSpecController.ts # Product specification request handling
│           ├── services/           # Business logic services
│           │   ├── productSpecService.ts    # Product specification business logic
│           │   ├── snsEventPublisher.ts     # AWS SNS event publishing
│           │   └── shared/         # Shared services (external dependencies)
│           │       ├── smartCacheService.ts # Environment-aware cache strategy
│           │       └── cacheService.ts      # Redis cache implementation
│           ├── models/             # Data models and schemas
│           │   └── ProductSpec.ts  # Mongoose model for product specifications
│           ├── schemas/            # Validation schemas
│           │   └── productSpecSchema.ts # Joi validation schemas
│           ├── config/             # Configuration modules
│           │   ├── database.ts     # MongoDB connection with pooling
│           │   ├── redis.ts        # Redis cluster connection management
│           │   ├── secretsManager.ts # AWS Secrets Manager configuration
│           │   ├── ssmParameterStore.ts # AWS SSM Parameter Store
│           │   ├── sns.ts          # AWS SNS configuration
│           │   └── swagger.ts      # Swagger/OpenAPI documentation setup
│           ├── utils/              # Utility functions
│           │   ├── logger.ts       # Winston logger with filtering for CloudWatch
│           │   ├── performanceTracker.ts # Performance monitoring utilities
│           │   ├── tokenHelper.ts  # JWT token utility functions
│           │   └── timeout.ts      # Request timeout utilities
│           ├── types/              # TypeScript type definitions
│           │   ├── index.ts        # Custom types and interfaces
│           │   ├── auth.ts         # Authentication types
│           │   ├── common.ts       # Common shared types
│           │   ├── productSpec.ts  # Product specification types
│           │   ├── redis.ts        # Redis types
│           │   ├── secretsManager.ts # AWS Secrets Manager types
│           │   ├── ssmParameterStore.ts # AWS SSM types
│           │   ├── performance.ts  # Performance monitoring types
│           │   ├── productAttributes.ts # Product attributes types
│           │   ├── materials.ts    # Materials types
│           │   ├── apparel-bom.ts  # Apparel BOM types
│           │   ├── errorHandler.ts # Error handling types
│           │   └── external.d.ts   # External library type declarations
│           ├── tests/              # Comprehensive test suite
│           │   ├── auth.test.ts    # Authentication and authorization tests
│           │   ├── database.test.ts # Database connection and operations tests
│           │   ├── performance.test.ts # Performance monitoring tests
│           │   ├── productSpecs.test.ts # Product specification API tests
│           │   ├── productSpecs_fixed.test.ts # Fixed product specs tests
│           │   ├── security.test.ts # Security middleware tests
│           │   ├── publishEvent.test.ts # Event publishing tests
│           │   ├── apparel-bom.test.ts # Apparel BOM tests
│           │   ├── apparel-bom-flat.test.ts # Flat apparel BOM tests
│           │   └── setup.ts        # Test setup and configuration
│           ├── cert/               # SSL certificates
│           │   └── global-bundle.pem # Global certificate bundle
│           └── dist/               # Compiled TypeScript output (generated)
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB (local or AWS DocumentDB for production)
- Redis (AWS ElastiCache for production)
- AWS CLI configured (for production deployment)

### Development Environment Setup

**Service (API)**
```bash
# Navigate to service directory
cd services/product-spec-service/src

# Install dependencies
npm install

# Copy environment template
cp .env.dev .env.dev

# Start development server (uses in-memory cache)
NODE_ENV=development npm run dev

# Or start with specific environment
npm run nonprod  # For non-production testing
```

**Lambda (Event Publisher)**
```bash
# Navigate to lambda directory
cd lambdas/product-spec-event-publisher/src

# Install dependencies
npm install

# Copy environment template
cp .env.dev .env.dev

# Run tests
npm test

# Build lambda
npm run build
```

### Available Scripts

**Service Scripts:**
```bash
npm run start        # Production server
npm run dev          # Development with hot reload
npm run nonprod      # Non-production environment
npm run build        # Compile TypeScript
npm run test         # Run all tests
npm run test:coverage # Run tests with coverage
npm run lint         # Check code quality
npm run lint:fix     # Fix code quality issues
npm run format       # Format code with Prettier
```

**Lambda Scripts:**
```bash
npm run build        # Compile TypeScript
npm run test         # Run lambda tests
npm run dev          # Development mode
npm run lint:fix     # Fix code quality issues
```
### Environment-Specific Behavior

| Environment | Cache Backend | Database | AWS Services | Redis Required |
|-------------|---------------|----------|--------------|----------------|
| `development` | In-memory (node-cache) | Local MongoDB | ❌ Disabled | ❌ No |
| `nonprod` | Redis (AWS ElastiCache) | AWS DocumentDB | ✅ Enabled | ✅ Yes |
| `production` | Redis (AWS ElastiCache) | AWS DocumentDB | ✅ Enabled | ✅ Yes |

## API Documentation

### Swagger Integration

This project includes comprehensive Swagger/OpenAPI 3.0 documentation that provides:

- **Interactive API Explorer**: Test endpoints directly from the browser
- **Detailed Schema Documentation**: Complete request/response models
- **Authentication Examples**: JWT token usage and API key authentication
- **Performance Metrics**: Response time documentation and monitoring endpoints
- **Error Response Documentation**: Comprehensive error handling examples

#### Accessing Swagger Documentation

1. **Development Environment**: `http://localhost:3000/api-docs`
2. **Production Environment**: `https://your-domain.com/api-docs`

#### Swagger Configuration

The Swagger setup is configured in `src/config/swagger.ts` and includes:

- OpenAPI 3.0 specification
- JWT Bearer token authentication
- API key authentication
- Request/response validation
- Performance monitoring endpoints
- Security middleware documentation

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "metadata": {
    "timestamp": "2025-07-04T12:00:00Z",
    "requestId": "uuid-here",
    "responseTime": "45ms"
  }
}
```

### Error Handling

Error responses include detailed information:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "limit",
        "message": "Must be between 1 and 100"
      }
    ]
  },
  "metadata": {
    "timestamp": "2025-07-04T12:00:00Z",
    "requestId": "uuid-here"
  }
}
```