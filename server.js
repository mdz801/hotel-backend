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
const reservaServicioRoutes = require('./routes/reservaServicioRoutes');
const reservaExperienciaRoutes = require('./routes/reservaExperienciaRoutes');
const politicaCancelacionRoutes = require('./routes/politicaCancelacionRoutes');
const membresiaRoutes = require('./routes/membresiaRoutes');
const calificacionRoutes = require('./routes/calificacionRoutes');
const temporadaRoutes = require('./routes/temporadaRoutes'); // ✅ NUEVO
const detalleReservaRoutes = require('./routes/detalleReservaRoutes');
const puntosFidelizacionRoutes = require('./routes/puntosFidelizacionRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes');

const app = express();

// ============ CONFIGURACIÓN CORS MEJORADA ============
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',      // Backend mismo
      'http://localhost:4200',      // Frontend Angular (desarrollo)
      'http://localhost:5173',      // Vite dev server
      'http://localhost:5174',      // Vite dev server alternativo
      'http://127.0.0.1:4200',      // Frontend Angular (localhost)
      'http://127.0.0.1:3000',      // Backend (localhost)
      process.env.FRONTEND_URL,     // URL desde .env si existe
      process.env.CLIENT_URL        // URL alternativa desde .env
    ].filter(Boolean); // Elimina valores undefined/null

    // En producción, solo permite CORS de dominios específicos
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'development') {
      // En desarrollo, permite cualquier origen
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido para este origen'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// ============ MIDDLEWARE ============
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware para logs de peticiones en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

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
app.use('/api/reservas-servicios', verificarToken, reservaServicioRoutes);
app.use('/api/reservas-experiencias', verificarToken, reservaExperienciaRoutes);
app.use('/api/politicas-cancelacion', verificarToken, politicaCancelacionRoutes);
app.use('/api/membresias', verificarToken, membresiaRoutes);
app.use('/api/calificaciones', verificarToken, calificacionRoutes);
app.use('/api/temporadas', verificarToken, temporadaRoutes); // ✅ NUEVO
app.use('/api/detalles-reserva', verificarToken, detalleReservaRoutes);
app.use('/api/puntos-fidelizacion', verificarToken, puntosFidelizacionRoutes);
app.use('/api/auditoria', verificarToken, auditoriaRoutes);

// ============ RUTA RAÍZ ============
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API Hotel - Sistema de Gestión Hotelera Backoffice',
    version: '2.4',
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
      reservas_servicios: '/api/reservas-servicios',
      reservas_experiencias: '/api/reservas-experiencias',
      politicas_cancelacion: '/api/politicas-cancelacion',
      membresias: '/api/membresias',
      calificaciones: '/api/calificaciones',
      temporadas: '/api/temporadas', // ✅ NUEVO
      detalles_reserva: '/api/detalles-reserva',
      puntos_fidelizacion: '/api/puntos-fidelizacion',
      auditoria: '/api/auditoria'
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
      console.log('\n📦 MÓDULOS ACTIVOS:');
      console.log('   ├─ Hoteles');
      console.log('   ├─ Usuarios');
      console.log('   ├─ Huéspedes');
      console.log('   ├─ Habitaciones');
      console.log('   ├─ Tipos de Habitación');
      console.log('   ├─ Tarifas');
      console.log('   ├─ Reservas');
      console.log('   ├─ Pagos');
      console.log('   ├─ Servicios Adicionales');
      console.log('   ├─ Experiencias');
      console.log('   ├─ Reservas-Servicios');
      console.log('   ├─ Reservas-Experiencias');
      console.log('   ├─ Políticas Cancelación');
      console.log('   ├─ Membresías');
      console.log('   ├─ Calificaciones');
      console.log('   └─ Temporadas ⭐ NUEVO');
      console.log('\n🎯 ENDPOINTS DESTACADOS:');
      console.log(`   💰 Tarifas:            http://localhost:${PORT}/api/tarifas`);
      console.log(`   💳 Pagos:              http://localhost:${PORT}/api/pagos`);
      console.log(`   🎯 Servicios:          http://localhost:${PORT}/api/servicios-adicionales`);
      console.log(`   🎭 Experiencias:       http://localhost:${PORT}/api/experiencias`);
      console.log(`   🔗 Reserva-Servicios:  http://localhost:${PORT}/api/reservas-servicios`);
      console.log(`   🔗 Reserva-Experienc:  http://localhost:${PORT}/api/reservas-experiencias`);
      console.log(`   📋 Políticas:          http://localhost:${PORT}/api/politicas-cancelacion`);
      console.log(`   🏆 Membresías:         http://localhost:${PORT}/api/membresias`);
      console.log(`   ⭐ Calificaciones:     http://localhost:${PORT}/api/calificaciones`);
      console.log(`   🏖️  Temporadas:        http://localhost:${PORT}/api/temporadas`);
      console.log('\n✅ Sistema listo para recibir peticiones');
      console.log('========================================\n');
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