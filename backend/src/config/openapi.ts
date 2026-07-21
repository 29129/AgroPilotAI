export const openApiDocument = {
  openapi: '3.0.3',
  info: { title: 'AgroPilot AI API', version: '1.0.0', description: 'API de apoyo a decisiones agrícolas. Todas las respuestas usan el envelope estándar.' },
  servers: [{ url: '/api/v1', description: 'Current server' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      ApiSuccess: { type: 'object', required: ['success', 'data', 'meta'], properties: { success: { type: 'boolean', example: true }, data: {}, meta: { type: 'object', properties: { requestId: { type: 'string', format: 'uuid' } } } } },
      ApiError: { type: 'object', required: ['success', 'error', 'meta'], properties: { success: { type: 'boolean', example: false }, error: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' }, details: {} } }, meta: { type: 'object', properties: { requestId: { type: 'string', format: 'uuid' } } } } },
      AuthInput: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', format: 'password', minLength: 8 } } },
    },
  },
  paths: {
    '/auth/register': { post: { summary: 'Registra un productor', requestBody: { required: true, content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/AuthInput' }], properties: { name: { type: 'string', example: 'Ana Pérez' } } } } } }, responses: { '201': { description: 'Usuario y tokens', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiSuccess' } } } }, '400': { description: 'Datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiError' } } } } } } },
    '/auth/login': { post: { summary: 'Inicia sesión', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthInput' } } } }, responses: { '200': { description: 'Usuario y tokens' }, '401': { description: 'Credenciales inválidas' } } } },
    '/auth/refresh': { post: { summary: 'Rota un refresh token', responses: { '200': { description: 'Nuevos tokens' }, '401': { description: 'Token inválido' } } } },
    '/auth/logout': { post: { summary: 'Revoca un refresh token', responses: { '200': { description: 'Sesión cerrada' } } } },
    '/auth/me': { get: { summary: 'Obtiene el perfil actual', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Perfil' }, '401': { description: 'Sesión requerida' } } } },
  },
};
