const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { initDB } = require('./config/database');
const hotelRoutes = require('./routes/hotelRoutes');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const huespedRoutes = require('./routes/huespedRoutes'); // ← AGREGAR

const app = express();

app.use(cors());
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use('/api/hoteles', hotelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/huespedes', huespedRoutes); // ← AGREGAR

app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API Hotel funcionando con Oracle',
    modulos: {
      hoteles: '/api/hoteles',
      autenticacion: '/api/auth',
      usuarios: '/api/usuarios',
      huespedes: '/api/huespedes' // ← AGREGAR
    }
  });
});

async function startServer() {
  try {
    await initDB();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
      console.log(`📘 Swagger en http://localhost:${PORT}/api-docs`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/login`);
      console.log(`👥 Usuarios: http://localhost:${PORT}/api/usuarios`);
      console.log(`🏨 Huéspedes: http://localhost:${PORT}/api/huespedes`); // ← AGREGAR
    });
  } catch (error) {
    console.error('❌ Error al iniciar la aplicación:', error);
    process.exit(1);
  }
}

startServer();