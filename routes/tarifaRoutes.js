// routes/tarifaRoutes.js
const express = require('express');
const router = express.Router();
const tarifaController = require('../controllers/TarifaController');
const verificarToken = require('../middleware/verificarToken');
const { verificarRol } = require('../middleware/verificarRol');

// =====================================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// =====================================================
router.use(verificarToken);

// =====================================================
// RUTAS DE CONSULTA (GET)
// =====================================================

/**
 * @swagger
 * /api/tarifas:
 *   get:
 *     summary: Listar tarifas con filtros opcionales
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID del hotel
 *       - in: query
 *         name: tipoHabitacionId
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de habitación
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ACTIVA, INACTIVA]
 *         description: Filtrar por estado
 *       - in: query
 *         name: soloActivas
 *         schema:
 *           type: boolean
 *         description: Mostrar solo tarifas activas
 *     responses:
 *       200:
 *         description: Lista de tarifas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tarifa'
 *                 count:
 *                   type: integer
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get(
    '/',
    verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA'),
    tarifaController.listar
);

/**
 * @swagger
 * /api/tarifas/vigente:
 *   get:
 *     summary: Obtener tarifa vigente para una fecha específica
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *       - in: query
 *         name: tipoHabitacionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de habitación
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha a consultar (YYYY-MM-DD). Default hoy
 *     responses:
 *       200:
 *         description: Tarifa vigente encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tarifa'
 *       400:
 *         description: Datos incompletos
 *       404:
 *         description: No hay tarifa vigente
 *       500:
 *         description: Error del servidor
 */
router.get(
    '/vigente',
    verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA', 'CLIENTE'),
    tarifaController.obtenerTarifaVigente
);

/**
 * @swagger
 * /api/tarifas/historial:
 *   get:
 *     summary: Obtener historial de tarifas
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *       - in: query
 *         name: tipoHabitacionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de habitación
 *     responses:
 *       200:
 *         description: Historial de tarifas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tarifa'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error del servidor
 */
router.get(
    '/historial',
    verificarRol('ADMIN', 'GERENTE'),
    tarifaController.obtenerHistorial
);

/**
 * @swagger
 * /api/tarifas/validar-solapamiento:
 *   get:
 *     summary: Validar solapamiento de fechas de tarifas
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *       - in: query
 *         name: tipoHabitacionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del tipo de habitación
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (YYYY-MM-DD)
 *       - in: query
 *         name: tarifaIdExcluir
 *         schema:
 *           type: integer
 *         description: ID de tarifa a excluir de la validación
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     tieneSolapamiento:
 *                       type: boolean
 *                     mensaje:
 *                       type: string
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error del servidor
 */
router.get(
    '/validar-solapamiento',
    verificarRol('ADMIN', 'GERENTE'),
    tarifaController.validarSolapamiento
);

/**
 * @swagger
 * /api/tarifas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de tarifas
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: integer
 *         description: ID del hotel (opcional, si no se envía obtiene estadísticas globales)
 *     responses:
 *       200:
 *         description: Estadísticas de tarifas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalTarifas:
 *                       type: integer
 *                     tarifasActivas:
 *                       type: integer
 *                     tarifasInactivas:
 *                       type: integer
 *                     precioPromedio:
 *                       type: number
 *                     precioMinimo:
 *                       type: number
 *                     precioMaximo:
 *                       type: number
 *       404:
 *         description: No hay datos disponibles
 *       500:
 *         description: Error del servidor
 */
router.get(
    '/estadisticas',
    verificarRol('ADMIN', 'GERENTE'),
    tarifaController.obtenerEstadisticas
);

/**
 * @swagger
 * /api/tarifas/{id}:
 *   get:
 *     summary: Obtener tarifa por ID
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarifa
 *     responses:
 *       200:
 *         description: Tarifa encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tarifa'
 *       404:
 *         description: Tarifa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get(
    '/:id',
    verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA'),
    tarifaController.obtenerPorId
);

// =====================================================
// RUTAS DE CREACIÓN Y MODIFICACIÓN
// =====================================================

/**
 * @swagger
 * /api/tarifas:
 *   post:
 *     summary: Crear nueva tarifa
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelId
 *               - tipoHabitacionId
 *               - precioBase
 *               - fechaVigenciaInicio
 *             properties:
 *               hotelId:
 *                 type: integer
 *                 description: ID del hotel
 *                 example: 1
 *               tipoHabitacionId:
 *                 type: integer
 *                 description: ID del tipo de habitación
 *                 example: 2
 *               precioBase:
 *                 type: number
 *                 format: float
 *                 description: Precio base de la tarifa
 *                 example: 150.00
 *               moneda:
 *                 type: string
 *                 description: Código de moneda (default USD)
 *                 example: USD
 *               fechaVigenciaInicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio de vigencia (YYYY-MM-DD)
 *                 example: "2026-01-01"
 *               fechaVigenciaFin:
 *                 type: string
 *                 format: date
 *                 description: Fecha fin de vigencia (YYYY-MM-DD) - opcional
 *                 example: "2026-12-31"
 *               estado:
 *                 type: string
 *                 enum: [ACTIVA, INACTIVA]
 *                 description: Estado de la tarifa (default ACTIVA)
 *                 example: ACTIVA
 *     responses:
 *       201:
 *         description: Tarifa creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tarifa'
 *       400:
 *         description: Datos inválidos o incompletos
 *       500:
 *         description: Error del servidor
 */
router.post(
    '/',
    verificarRol('ADMIN', 'GERENTE'),
    tarifaController.crear
);

/**
 * @swagger
 * /api/tarifas/{id}:
 *   put:
 *     summary: Actualizar tarifa
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarifa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               precioBase:
 *                 type: number
 *                 format: float
 *                 description: Nuevo precio base
 *                 example: 175.00
 *               moneda:
 *                 type: string
 *                 description: Código de moneda
 *                 example: USD
 *               fechaVigenciaInicio:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha de inicio (YYYY-MM-DD)
 *                 example: "2026-01-01"
 *               fechaVigenciaFin:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha fin (YYYY-MM-DD)
 *                 example: "2026-12-31"
 *               estado:
 *                 type: string
 *                 enum: [ACTIVA, INACTIVA]
 *                 description: Estado de la tarifa
 *                 example: ACTIVA
 *     responses:
 *       200:
 *         description: Tarifa actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tarifa'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Tarifa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put(
    '/:id',
    verificarRol('ADMIN', 'GERENTE'),
    tarifaController.actualizar
);

/**
 * @swagger
 * /api/tarifas/{id}:
 *   delete:
 *     summary: Eliminar tarifa (soft delete - marca como INACTIVA)
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarifa
 *     responses:
 *       200:
 *         description: Tarifa eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Tarifa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete(
    '/:id',
    verificarRol('ADMIN', 'GERENTE'),
    tarifaController.eliminar
);

// =====================================================
// RUTAS DE ACCIONES ESPECÍFICAS (PATCH)
// =====================================================

/**
 * @swagger
 * /api/tarifas/{id}/activar:
 *   patch:
 *     summary: Activar tarifa
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarifa
 *     responses:
 *       200:
 *         description: Tarifa activada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tarifa'
 *                 message:
 *                   type: string
 *       404:
 *         description: Tarifa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch(
    '/:id/activar',
    verificarRol('ADMIN', 'GERENTE'),
    tarifaController.activar
);

/**
 * @swagger
 * /api/tarifas/{id}/desactivar:
 *   patch:
 *     summary: Desactivar tarifa
 *     tags: [Tarifas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tarifa
 *     responses:
 *       200:
 *         description: Tarifa desactivada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Tarifa'
 *                 message:
 *                   type: string
 *       404:
 *         description: Tarifa no encontrada
 *       500:
 *         description: Error del servidor
 */
router.patch(
    '/:id/desactivar',
    verificarRol('ADMIN', 'GERENTE'),
    tarifaController.desactivar
);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Tarifa:
 *       type: object
 *       properties:
 *         tarifaId:
 *           type: integer
 *           description: ID único de la tarifa
 *         hotelId:
 *           type: integer
 *           description: ID del hotel
 *         tipoHabitacionId:
 *           type: integer
 *           description: ID del tipo de habitación
 *         precioBase:
 *           type: number
 *           format: float
 *           description: Precio base de la tarifa
 *         moneda:
 *           type: string
 *           description: Código de moneda
 *         fechaVigenciaInicio:
 *           type: string
 *           format: date
 *           description: Fecha de inicio de vigencia
 *         fechaVigenciaFin:
 *           type: string
 *           format: date
 *           description: Fecha fin de vigencia (puede ser null)
 *         estado:
 *           type: string
 *           enum: [ACTIVA, INACTIVA]
 *           description: Estado de la tarifa
 *         hotelNombre:
 *           type: string
 *           description: Nombre del hotel
 *         tipoHabitacionNombre:
 *           type: string
 *           description: Nombre del tipo de habitación
 *         capacidadAdultos:
 *           type: integer
 *           description: Capacidad de adultos del tipo de habitación
 *         capacidadNinos:
 *           type: integer
 *           description: Capacidad de niños del tipo de habitación
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         usuarioCreacion:
 *           type: string
 *           description: Usuario que creó la tarifa
 *         fechaModificacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última modificación
 *         usuarioModificacion:
 *           type: string
 *           description: Usuario que modificó la tarifa
 *       example:
 *         tarifaId: 1
 *         hotelId: 1
 *         tipoHabitacionId: 2
 *         precioBase: 150.00
 *         moneda: USD
 *         fechaVigenciaInicio: "2026-01-01"
 *         fechaVigenciaFin: "2026-12-31"
 *         estado: ACTIVA
 *         hotelNombre: "Hotel Plaza"
 *         tipoHabitacionNombre: "Suite Deluxe"
 *         capacidadAdultos: 2
 *         capacidadNinos: 1
 *         fechaCreacion: "2025-12-30T10:30:00Z"
 *         usuarioCreacion: "admin@hotel.com"
 */