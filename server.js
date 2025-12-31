const express = require('express');
const cors = require('cors');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { initDB } = require('./config/database');
const verificarToken = require('./middleware/verificarToken');

// ============ IMPORTAR RUTAS ============
const hotelRoutes = require('./routes/hotelRoutes');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const huespedRoutes = require('./routes/huespedRoutes');
const reservaRoutes = require('./routes/reservaRoutes');
const habitacionRoutes = require('./routes/habitacionRoutes');
const tipoHabitacionRoutes = require('./routes/tipoHabitacionRoutes');
const tarifaRoutes = require('./routes/tarifaRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const servicioAdicionalRoutes = require('./routes/servicioAdicionalRoutes');
const experienciaRoutes = require('./routes/experienciaRoutes');
const reservaServicioRoutes = require('./routes/reservaServicioRoutes'); // ✅ NUEVO
const reservaExperienciaRoutes = require('./routes/reservaExperienciaRoutes'); // ✅ NUEVO
const politicaCancelacionRoutes = require('./routes/politicaCancelacionRoutes'); // ✅ NUEVO

const app = express();

app.use(cors());
app.use(express.json());

// ============ SWAGGER DOCUMENTATION ============
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============ RUTAS PÚBLICAS ============
app.use('/api/auth', authRoutes);

// ============ RUTAS PROTEGIDAS (Requieren JWT) ============
app.use('/api/hoteles', verificarToken, hotelRoutes);
app.use('/api/usuarios', verificarToken, usuarioRoutes);
app.use('/api/huespedes', verificarToken, huespedRoutes);
app.use('/api/reservas', verificarToken, reservaRoutes);
app.use('/api/habitaciones', verificarToken, habitacionRoutes);
app.use('/api/tipos-habitacion', verificarToken, tipoHabitacionRoutes);
app.use('/api/tarifas', verificarToken, tarifaRoutes);
app.use('/api/pagos', verificarToken, pagoRoutes);
app.use('/api/servicios-adicionales', verificarToken, servicioAdicionalRoutes);
app.use('/api/experiencias', verificarToken, experienciaRoutes);
app.use('/api/reservas-servicios', verificarToken, reservaServicioRoutes); // ✅ NUEVO
app.use('/api/reservas-experiencias', verificarToken, reservaExperienciaRoutes); // ✅ NUEVO
app.use('/api/politicas-cancelacion', verificarToken, politicaCancelacionRoutes); // ✅ NUEVO

// ============ RUTA RAÍZ ============
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API Hotel - Sistema de Gestión Hotelera Backoffice',
    version: '2.0',
    modulos_disponibles: {
      autenticacion: '/api/auth',
      hoteles: '/api/hoteles',
      usuarios: '/api/usuarios',
      huespedes: '/api/huespedes',
      reservas: '/api/reservas',
      habitaciones: '/api/habitaciones',
      tipos_habitacion: '/api/tipos-habitacion',
      tarifas: '/api/tarifas',
      pagos: '/api/pagos',
      servicios_adicionales: '/api/servicios-adicionales',
      experiencias: '/api/experiencias',
      reservas_servicios: '/api/reservas-servicios', // ✅ NUEVO
      reservas_experiencias: '/api/reservas-experiencias', // ✅ NUEVO
      politicas_cancelacion: '/api/politicas-cancelacion' // ✅ NUEVO
    },
    documentacion: '/api-docs',
    estado: 'Operativo'
  });
});

// ============ INICIAR SERVIDOR ============
async function startServer() {
  try {
    await initDB();
    console.log('✅ Conexión a Oracle establecida correctamente');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`🏨 SISTEMA DE GESTIÓN HOTELERA - BACKOFFICE`);
      console.log('🚀 ========================================\n');
      console.log(`📡 Servidor ejecutándose en: http://localhost:${PORT}`);
      console.log(`📘 Documentación Swagger:    http://localhost:${PORT}/api-docs`);
      console.log(`🔐 Autenticación:             http://localhost:${PORT}/api/auth/login`);

    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar la aplicación:', error);
    console.error('Detalles:', error.message);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('⚠️  Excepción no capturada:', error);
  process.exit(1);
});

startServer();