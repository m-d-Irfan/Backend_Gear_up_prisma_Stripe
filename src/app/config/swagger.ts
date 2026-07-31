import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GearUp REST API Documentation 🏋️',
      version: '1.0.0',
      description:
        'Interactive Swagger API documentation for GearUp sports and outdoor gear rental platform.',
      contact: {
        name: 'GearUp API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
      {
        url: '/api/v1',
        description: 'Vercel Live Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token in the format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new Customer or Provider account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Alice Customer' },
                    email: { type: 'string', example: 'alice@example.com' },
                    password: { type: 'string', example: 'Customer123!' },
                    role: { type: 'string', enum: ['CUSTOMER', 'PROVIDER'], example: 'CUSTOMER' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'User registered successfully' },
            '400': { description: 'Email already exists or invalid input' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User login to receive JWT Access Token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'admin@gearup.com' },
                    password: { type: 'string', example: 'Admin123!' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'User logged in successfully' },
            '401': { description: 'Invalid email or password' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get currently authenticated user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Profile retrieved successfully' },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/categories': {
        get: {
          tags: ['Categories'],
          summary: 'List all gear categories (Public)',
          responses: {
            '200': { description: 'Categories list' },
          },
        },
        post: {
          tags: ['Categories'],
          summary: 'Create a new gear category (Admin Only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', example: 'Climbing & Trekking' },
                    description: { type: 'string', example: 'Harnesses, ropes, and carabiners' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Category created successfully' },
          },
        },
      },
      '/gear': {
        get: {
          tags: ['Gear Inventory'],
          summary: 'Search and filter sports gear (Public)',
          parameters: [
            { name: 'searchTerm', in: 'query', schema: { type: 'string' }, description: 'Search keyword' },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            '200': { description: 'Gear items list' },
          },
        },
        post: {
          tags: ['Gear Inventory'],
          summary: 'Create a gear listing (Provider / Admin)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'pricePerDay', 'location', 'categoryId'],
                  properties: {
                    title: { type: 'string', example: '2-Person Backpacking Tent' },
                    description: { type: 'string', example: 'Lightweight trail tent' },
                    pricePerDay: { type: 'number', example: 25.0 },
                    location: { type: 'string', example: 'Denver, CO' },
                    brand: { type: 'string', example: 'REI Co-op' },
                    stock: { type: 'integer', example: 3 },
                    categoryId: { type: 'string', example: 'category-uuid-here' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Gear listing created' },
          },
        },
      },
      '/orders': {
        post: {
          tags: ['Rental Orders'],
          summary: 'Place a rental booking order (Customer)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['gearId', 'startDate', 'endDate'],
                  properties: {
                    gearId: { type: 'string', example: 'gear-uuid-here' },
                    startDate: { type: 'string', example: '2026-08-01' },
                    endDate: { type: 'string', example: '2026-08-05' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Rental order placed' },
          },
        },
      },
      '/payments/create-checkout-session': {
        post: {
          tags: ['Payments'],
          summary: 'Create Stripe PaymentIntent session (Customer)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['orderId'],
                  properties: {
                    orderId: { type: 'string', example: 'order-uuid-here' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Stripe PaymentIntent generated' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
