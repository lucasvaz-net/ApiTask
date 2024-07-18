const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gerenciamento de Tarefas',
      version: '1.0.0',
      description: 'API para gerenciar tarefas e usuários',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? 'https://apitask.lucasvaz.dev.br' : `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            username: {
              type: 'string',
              example: 'john_doe',
            },
            email: {
              type: 'string',
              example: 'john.doe@example.com',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            profilePicture: {
              type: 'string',
              example: 'https://example.com/avatar.jpg',
            },
            bio: {
              type: 'string',
              example: 'Software developer from XYZ',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-07-18T15:43:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-07-18T15:43:00Z',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              example: '2023-07-18T15:43:00Z',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Implement authentication',
            },
            description: {
              type: 'string',
              example: 'Implement user authentication using JWT',
            },
            status: {
              type: 'string',
              example: 'pending',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'medium',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              example: '2023-08-01T12:00:00Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-07-18T15:43:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2023-07-18T15:43:00Z',
            },
            tags: {
              type: 'string',
              example: 'authentication,security',
            },
            attachments: {
              type: 'string',
              example: 'https://example.com/docs/auth_spec.pdf',
            },
            userId: {
              type: 'integer',
              example: 1,
            },
            assignedTo: {
              type: 'integer',
              example: 2,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/controllers/*.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
