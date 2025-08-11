const readScope = `api://${process.env.CLIENTID}/Productspec.Read`
const writeScope = `api://${process.env.CLIENTID}/Productspec.Write`

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Product Spec API',
        version: '1.0.0',
        description: 'A comprehensive API for managing product specifications.',
        contact: {
            name: 'SPS - Sourcing Team',
            email: 'spssupport@kmart.com.au',
        },
        termsOfService: 'https://www.kmart.com.au/terms',
    },
    tags: [
        {
            name: 'Product Specifications',
            description: 'Product specification management endpoints',
        },
        {
            name: 'External References',
            description: 'External reference management and search endpoints',
        },
        {
            name: 'Event Publisher',
            description: 'Manual event publishing and SNS integration endpoints',
        },
        {
            name: 'Health Check',
            description: 'System health and monitoring endpoints',
        },
    ],
    components: {
        securitySchemes: {
            oauth2: {
                type: 'oauth2',
                description: 'Azure AD OAuth2 authentication for Product Specifications API',
                name: 'Authorization',
                in: 'header',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                flows: {
                    implicit: {
                        authorizationUrl: `https://login.microsoftonline.com/${process.env.TENANT_ID || 'cba8ca03-8b95-448d-b259-98a44d112f7c'}/oauth2/v2.0/authorize`,
                        tokenUrl: `https://login.microsoftonline.com/${process.env.TENANT_ID || 'cba8ca03-8b95-448d-b259-98a44d112f7c'}/oauth2/v2.0/token`,
                        scopes: {
                            [readScope]: 'Read Product Spec',
                            [writeScope]: 'Write Product Spec',
                        },
                    },
                },
            },
        },
        schemas: {
            ExternalReference: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        nullable: true,
                        description: 'External reference identifier',
                    },
                    source: {
                        type: 'string',
                        nullable: true,
                        description: 'External reference source',
                    },
                },
            },
            IdName: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        nullable: true,
                        description: 'Unique identifier (new format)',
                    },
                    name: {
                        type: 'string',
                        nullable: true,
                        description: 'Display name',
                    },
                },
            },
            ProductSet: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        nullable: true,
                        description: 'Product set identifier',
                    },
                    name: {
                        type: 'string',
                        nullable: true,
                        description: 'Product set name',
                    },
                },
            },
            Material: {
                type: 'object',
                properties: {
                    _id: {
                        oneOf: [{ type: 'string' }, { type: 'object' }],
                        nullable: true,
                        description: 'Material identifier (new format)',
                    },
                    setAttribute: {
                        $ref: '#/components/schemas/IdName',
                        nullable: true,
                        description: 'Set attribute information',
                    },
                    materialType: {
                        type: 'string',
                        nullable: true,
                        description: 'Type of material',
                    },
                    materialOption: {
                        $ref: '#/components/schemas/IdName',
                        nullable: true,
                        description: 'Material option',
                    },
                    garmentComponent: {
                        type: 'string',
                        nullable: true,
                        description: 'Garment component this material is used for',
                    },
                    fabricSustainability: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/IdName' },
                        nullable: true,
                        description: 'Fabric sustainability information',
                    },
                },
            },
            BillOfMaterial: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        nullable: true,
                        description: 'Bill of material identifier',
                    },
                    description: {
                        type: 'string',
                        nullable: true,
                        description: 'BOM description',
                    },
                    materialOptions: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/IdName' },
                        nullable: true,
                        description: 'Material options (new format)',
                    },
                    fabricSustainabilities: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/IdName' },
                        nullable: true,
                        description: 'Fabric sustainability information (new format)',
                    },
                    materials: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Material' },
                        nullable: true,
                        description: 'Materials in this BOM',
                    },
                },
            },
            ProductAttribute: {
                type: 'object',
                properties: {
                    productCode: {
                        type: 'string',
                        nullable: true,
                        description: 'Product code identifier',
                    },
                    productId: {
                        type: 'string',
                        nullable: true,
                        description: 'Product ID',
                    },
                    productDescription: {
                        type: 'string',
                        nullable: true,
                        description: 'Product description',
                    },
                    yearRegistered: {
                        type: 'integer',
                        nullable: true,
                        description: 'Year the product was registered',
                    },
                    season: {
                        $ref: '#/components/schemas/IdName',
                        nullable: true,
                        description: 'Season information (new format)',
                    },
                    department: {
                        $ref: '#/components/schemas/IdName',
                        nullable: true,
                        description: 'Department information (new format)',
                    },
                    overseasStockBuffering: {
                        type: 'boolean',
                        nullable: true,
                        description: 'Overseas stock buffering flag',
                    },
                    sourcingAttribute1: {
                        type: 'string',
                        nullable: true,
                        description: 'Primary sourcing attribute',
                    },
                    sourcingAttribute2: {
                        type: 'string',
                        nullable: true,
                        description: 'Secondary sourcing attribute',
                    },
                },
            },
            ProductSpec: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        description: 'Unique identifier for the product specification',
                    },
                    // New format fields
                    externalReferences: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ExternalReference' },
                        nullable: true,
                        description: 'External references',
                    },
                    productSpecCode: {
                        type: 'string',
                        nullable: true,
                        description: 'Product specification code',
                    },
                    colourName: {
                        type: 'string',
                        nullable: true,
                        description: 'Color name for this specification',
                    },
                    optionId: {
                        type: 'string',
                        nullable: true,
                        description: 'Option identifier',
                    },
                    productAttribute: {
                        $ref: '#/components/schemas/ProductAttribute',
                        nullable: true,
                        description: 'Product attribute (singular, new format)',
                    },
                    boms: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/BillOfMaterial' },
                        nullable: true,
                        description: 'Bill of materials (new format)',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Creation timestamp',
                    },
                    __updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'MongoDB update timestamp',
                    },
                },
                example: {
                    // New format example
                    externalReferences: [{ id: 'EXT-001', source: 'Legacy System' }],
                    productSpecCode: 'ABC123-NEW',
                    colourName: 'Navy Blue',
                    optionId: 'OPT-001',
                    productAttribute: {
                        productCode: 'PROD-001',
                        productId: '12345',
                        productDescription: 'Premium Cotton T-Shirt',
                        yearRegistered: 2024,
                        season: { _id: 'SEASON-001', name: 'Summer 2024' },
                        department: { _id: 'DEPT-001', name: 'Apparel' },
                        overseasStockBuffering: true,
                        sourcingAttribute1: 'Vietnam',
                        sourcingAttribute2: 'Bangladesh',
                    },
                    boms: [
                        {
                            id: 'BOM-001',
                            description: 'Main fabric and trims',
                            materialOptions: [{ _id: 'MAT-OPT-001', name: 'Organic Cotton' }],
                            fabricSustainabilities: [{ _id: 'SUST-001', name: 'GOTS Certified' }],
                            materials: [
                                {
                                    _id: 'MAT-001',
                                    setAttribute: { _id: 'SET-FABRIC', name: 'Main Fabric' },
                                    materialType: 'Cotton Jersey',
                                    materialOption: { _id: 'OPT-001', name: '180 GSM' },
                                    garmentComponent: 'Body',
                                    fabricSustainability: [
                                        { _id: 'SUST-001', name: 'GOTS Certified' },
                                    ],
                                },
                            ],
                        },
                    ],
                    updatedAt: '2024-01-15T10:30:00Z',
                },
            },
            ApiResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        description: 'Indicates if the request was successful',
                    },
                    data: {
                        description: 'Response data',
                    },
                    message: {
                        type: 'string',
                        description: 'Success message',
                    },
                    error: {
                        type: 'string',
                        description: 'Error message if request failed',
                    },
                },
            },
            PaginatedResponse: {
                allOf: [
                    { $ref: '#/components/schemas/ApiResponse' },
                    {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                properties: {
                                    productSpecs: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/ProductSpec' },
                                    },
                                    pagination: {
                                        type: 'object',
                                        properties: {
                                            page: { type: 'number' },
                                            limit: { type: 'number' },
                                            total: { type: 'number' },
                                            pages: { type: 'number' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                ],
            },
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    error: {
                        type: 'string',
                        description: 'Error message',
                    },
                },
            },
        },
    },
    security: [
        {
            oauth2: [readScope, writeScope],
        },
    ],
    paths: {
        '/api/v1/product-spec': {
            get: {
                tags: ['Product Specifications'],
                summary: 'Get all product specifications',
                security: [{ oauth2: [readScope] }],
                description:
                    'Retrieve a paginated list of product specifications with powerful global search capabilities',
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        schema: { type: 'integer', minimum: 1 },
                        description: 'Page number for pagination (default: 1)',
                    },
                    {
                        name: 'limit',
                        in: 'query',
                        schema: { type: 'integer', minimum: 1, maximum: 100 },
                        description: 'Number of items per page (default: 10)',
                    },
                    {
                        name: 'sortBy',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['productSpecCode', 'colourName', 'createdAt', 'updatedAt'],
                        },
                        description: 'Field to sort by (default: createdAt)',
                    },
                    {
                        name: 'sortOrder',
                        in: 'query',
                        schema: { type: 'string', enum: ['asc', 'desc'] },
                        description: 'Sort order (default: desc)',
                    },
                    {
                        name: 'search',
                        in: 'query',
                        schema: { type: 'string' },
                        description:
                            'Global search across all fields including productSpecCode, colourName, productCode, product description, external references (ID and source), and other relevant fields',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PaginatedResponse' },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid query parameters',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Product Specifications'],
                summary: 'Create a new product specification',
                description: 'Create a new product specification with the provided data',
                security: [{ oauth2: [writeScope] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ProductSpec' },
                            example: {
                                productSpecId: 'SPEC-002',
                                productSpecCode: 'DEF456',
                                colourName: 'Forest Green',
                                optionId: 'OPT-002',
                                productAttributes: {
                                    productCode: 'PROD-002',
                                    productId: '67890',
                                    productDescription: 'Organic Cotton Hoodie',
                                    productSet: [{ id: 'SET-002', name: 'Winter Collection' }],
                                    yearRegistered: 2024,
                                    season: { id: 'SEASON-002', name: 'Winter 2024' },
                                    department: { id: 'DEPT-002', name: 'Casual Wear' },
                                    family: 'Hoodies',
                                    class: 'Comfort',
                                    overseasStockBuffering: false,
                                    sourcing1: 'Turkey',
                                    sourcing2: 'Portugal',
                                },
                                billOfMaterials: [
                                    {
                                        id: 'BOM-002',
                                        state: 'Draft',
                                        supplierRequestIssued: false,
                                        productQuoteAccepted: false,
                                        description: 'Main fabric, lining and hardware',
                                        washTreatments: [{ id: 'WASH-002', name: 'Pre-Wash' }],
                                        bomMaterialOptions: [
                                            { id: 'MAT-OPT-002', name: 'Recycled Polyester' },
                                        ],
                                        bomFabricSustainability: [
                                            { id: 'SUST-002', name: 'Recycled Content' },
                                        ],
                                        materials: [
                                            {
                                                id: 'MAT-002',
                                                set: { id: 'SET-FLEECE', name: 'Fleece Fabric' },
                                                materialType: 'Cotton Fleece',
                                                modifiedDate: '2024-01-20',
                                                modifiedBy: 'Jane Doe',
                                                garmentComponent: 'Main Body',
                                                materialOptions: { id: 'OPT-002', name: '320 GSM' },
                                                fabricSustainability: [
                                                    { id: 'SUST-002', name: 'Recycled Content' },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Product specification created successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/ApiResponse' },
                                        {
                                            type: 'object',
                                            properties: {
                                                data: { $ref: '#/components/schemas/ProductSpec' },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid input data',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/product-spec/{id}': {
            get: {
                tags: ['Product Specifications'],
                summary: 'Get a specific product specification by ID',
                security: [{ oauth2: [readScope] }],
                description: 'Retrieve a single product specification by its unique identifier',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Unique identifier of the product specification',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Product specification found',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/ApiResponse' },
                                        {
                                            type: 'object',
                                            properties: {
                                                data: { $ref: '#/components/schemas/ProductSpec' },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Product specification not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid ID format',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                },
            },
            patch: {
                tags: ['Product Specifications'],
                summary: 'Update a product specification',
                security: [{ oauth2: [writeScope] }],
                description: 'Update an existing product specification with partial data',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Unique identifier of the product specification to update',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ProductSpec' },
                            example: {
                                colourName: 'Midnight Black',
                                productAttributes: {
                                    productDescription:
                                        'Updated Premium Cotton T-Shirt with new features',
                                    family: 'Updated T-Shirts',
                                    class: 'Premium',
                                },
                                billOfMaterials: [
                                    {
                                        id: 'BOM-001-UPDATED',
                                        state: 'Active',
                                        description: 'Updated main fabric and trims',
                                        materials: [
                                            {
                                                id: 'MAT-001-UPDATED',
                                                materialType: 'Organic Cotton Jersey',
                                                garmentComponent: 'Main Body',
                                                modifiedDate: '2024-01-20',
                                                modifiedBy: 'Update User',
                                            },
                                        ],
                                    },
                                ],
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Product specification updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/ApiResponse' },
                                        {
                                            type: 'object',
                                            properties: {
                                                data: { $ref: '#/components/schemas/ProductSpec' },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Product specification not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid input data or ID format',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['Product Specifications'],
                summary: 'Delete a product specification',
                security: [{ oauth2: [writeScope] }],
                description: 'Delete an existing product specification permanently',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Unique identifier of the product specification to delete',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Product specification deleted successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/ApiResponse' },
                                        {
                                            type: 'object',
                                            properties: {
                                                data: { $ref: '#/components/schemas/ProductSpec' },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Product specification not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid ID format',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/product-spec/external-reference': {
            get: {
                tags: ['External References'],
                summary: 'Get product specifications by external reference',
                security: [{ oauth2: [readScope] }],
                description:
                    'Retrieve product specifications filtered by external reference ID and/or source',
                parameters: [
                    {
                        name: 'externalRefId',
                        in: 'query',
                        schema: { type: 'string' },
                        description: 'External reference ID to search for',
                    },
                    {
                        name: 'source',
                        in: 'query',
                        schema: { type: 'string' },
                        description: 'Source system of the external reference',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Product specifications found by external reference',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/ApiResponse' },
                                        {
                                            type: 'object',
                                            properties: {
                                                data: {
                                                    type: 'array',
                                                    items: {
                                                        $ref: '#/components/schemas/ProductSpec',
                                                    },
                                                },
                                                count: {
                                                    type: 'integer',
                                                    description:
                                                        'Number of product specifications found',
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid request - missing required parameters',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/product-spec/{id}/external-reference': {
            patch: {
                tags: ['External References'],
                summary: 'Update external reference for a product specification',
                security: [{ oauth2: [writeScope] }],
                description:
                    'Update or add external reference information for a specific product specification',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Unique identifier of the product specification',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    externalReference: {
                                        $ref: '#/components/schemas/ExternalReference',
                                    },
                                },
                                required: ['externalReference'],
                            },
                            example: {
                                externalReference: {
                                    id: 'EXT-REF-12345',
                                    source: 'PLM',
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'External reference updated successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/ApiResponse' },
                                        {
                                            type: 'object',
                                            properties: {
                                                data: { $ref: '#/components/schemas/ProductSpec' },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Product specification not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid input data or ID format',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/api/v1/product-spec/{recordId}/publish-event': {
            post: {
                tags: ['Event Publisher'],
                summary: 'Manually publish an event for a product specification',
                security: [{ oauth2: [writeScope] }],
                description:
                    'Manually trigger an SNS event for a specific product specification record. The system will fetch the record by ID and publish the event with the complete record data.',
                parameters: [
                    {
                        name: 'recordId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Unique identifier of the product specification record',
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    eventType: {
                                        type: 'string',
                                        enum: [
                                            'ProductSpecCreated',
                                            'ProductSpecUpdated',
                                            'ProductSpecDeleted',
                                        ],
                                        description: 'Type of event to publish',
                                    },
                                },
                                required: ['eventType'],
                            },
                            example: {
                                eventType: 'ProductSpecUpdated',
                                metadata: {
                                    userId: 'user123',
                                    reason: 'Manual sync required after system recovery',
                                },
                            },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Event published successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    allOf: [
                                        { $ref: '#/components/schemas/ApiResponse' },
                                        {
                                            type: 'object',
                                            properties: {
                                                data: {
                                                    type: 'object',
                                                    properties: {
                                                        success: {
                                                            type: 'boolean',
                                                            example: true,
                                                        },
                                                        eventId: {
                                                            type: 'string',
                                                            description:
                                                                'Unique identifier of the published event',
                                                        },
                                                        eventType: {
                                                            type: 'string',
                                                            description:
                                                                'Type of event that was published',
                                                        },
                                                        timestamp: {
                                                            type: 'string',
                                                            format: 'date-time',
                                                            description:
                                                                'Timestamp when the event was published',
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    '404': {
                        description: 'Product specification not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '400': {
                        description: 'Invalid request - missing or invalid event type',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                    '500': {
                        description: 'Internal server error',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ApiResponse' },
                            },
                        },
                    },
                },
            },
        },
        '/healthcheck': {
            get: {
                tags: ['Health Check'],
                summary: 'Health check endpoint',
                description: 'Check if the API is up and running',
                responses: {
                    '200': {
                        description: 'API is healthy',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            example: 'OK',
                                        },
                                        timestamp: {
                                            type: 'string',
                                            format: 'date-time',
                                            example: '2023-07-04T12:00:00.000Z',
                                        },
                                        service: {
                                            type: 'string',
                                            example: 'Product Specifications API',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
}

export default swaggerDocument
