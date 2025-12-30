const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema de Gestión Hotelera',
      version: '1.0.0',
      description:
        'API backend en Node.js que consume lógica de negocio implementada en Oracle PL/SQL (Packages, Triggers, Funciones)'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ]
  },

  // 👇 AQUÍ ESTÁ EL PROBLEMA NORMALMENTE
  apis: [
    './routes/*.js',        // ← rutas
    './controllers/*.js'    // ← o controllers si ahí pusiste Swagger
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
