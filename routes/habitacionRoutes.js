// routes/habitacion.routes.js
const express = require('express');
const router = express.Router();
const habitacionController = require('../controllers/habitacionController');
// const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Habitacion:
 *       type: object
 *       properties:
 *         HABITACION_ID:
 *           type: number
 *           description: ID único de la habitación
 *         HOTEL_ID:
 *           type: number
 *           description: ID del hotel
 *         TIPO_HABITACION_ID:
 *           type: number
 *           description: ID del tipo de habitación
 *         NUMERO_HABITACION:
 *           type: string
 *           description: Número o identificador de la habitación
 *         PISO:
 *           type: number
 *           description: Piso donde se encuentra
 *         VISTA:
 *           type: string
 *           description: Vista de la habitación (Mar, Ciudad, Jardín, etc.)
 *         ESTADO:
 *           type: string
 *           enum: [DISPONIBLE, OCUPADA, MANTENIMIENTO, LIMPIEZA, BLOQUEADA]
 *           description: Estado actual de la habitación
 *         OBSERVACIONES:
 *           type: string
 *           description: Notas adicionales
 *         TIPO_HABITACION:
 *           type: string
 *           description: Nombre del tipo de habitación
 *         CAPACIDAD_ADULTOS:
 *           type: number
 *           description: Capacidad máxima de adultos
 *         CAPACIDAD_NINOS:
 *           type: number
 *           description: Capacidad máxima de niños
 *         METROS_CUADRADOS:
 *           type: number
 *           description: Tamaño en metros cuadrados
 *         HOTEL_NOMBRE:
 *           type: string
 *           description: Nombre del hotel
 *         FECHA_CREACION:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 * 
 *     HabitacionInput:
 *       type: object
 *       required:
 *         - hotelId
 *         - tipoHabitacionId
 *         - numeroHabitacion
 *       properties:
 *         hotelId:
 *           type: number
 *           description: ID del hotel
 *           example: 1
 *         tipoHabitacionId:
 *           type: number
 *           description: ID del tipo de habitación
 *           example: 2
 *         numeroHabitacion:
 *           type: string
 *           description: Número de la habitación
 *           example: "301"
 *         piso:
 *           type: number
 *           description: Piso
 *           example: 3
 *         vista:
 *           type: string
 *           description: Vista de la habitación
 *           example: "Mar"
 *         estado:
 *           type: string
 *           enum: [DISPONIBLE, OCUPADA, MANTENIMIENTO, LIMPIEZA, BLOQUEADA]
 *           default: DISPONIBLE
 *           example: "DISPONIBLE"
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 *           example: "Habitación renovada recientemente"
 * 
 *     EstadoUpdate:
 *       type: object
 *       required:
 *         - estado
 *       properties:
 *         estado:
 *           type: string
 *           enum: [DISPONIBLE, OCUPADA, MANTENIMIENTO, LIMPIEZA, BLOQUEADA]
 *           example: "LIMPIEZA"
 *         observaciones:
 *           type: string
 *           example: "Iniciando limpieza profunda"
 * 
 *     MantenimientoInput:
 *       type: object
 *       required:
 *         - observaciones
 *       properties:
 *         observaciones:
 *           type: string
 *           example: "Reparación de aire acondicionado"
 * 
 *     Estadisticas:
 *       type: object
 *       properties:
 *         TOTAL_HABITACIONES:
 *           type: number
 *         DISPONIBLES:
 *           type: number
 *         OCUPADAS:
 *           type: number
 *         EN_LIMPIEZA:
 *           type: number
 *         EN_MANTENIMIENTO:
 *           type: number
 *         BLOQUEADAS:
 *           type: number
 *         PORCENTAJE_OCUPACION:
 *           type: number
 *           format: float
 * 
 *   responses:
 *     UnauthorizedError:
 *       description: Token de autenticación inválido o faltante
 *     NotFoundError:
 *       description: Recurso no encontrado
 *     ValidationError:
 *       description: Error de validación en los datos enviados
 */

/**
 * @swagger
 * tags:
 *   name: Habitaciones
 *   description: Gestión de habitaciones del hotel
 */

/**
 * @swagger
 * /api/habitaciones:
 *   post:
 *     summary: Crear nueva habitación
 *     tags: [Habitaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HabitacionInput'
 *     responses:
 *       201:
 *         description: Habitación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Habitacion'
 *                 message:
 *                   type: string
 *                   example: "Habitación creada exitosamente"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Ya existe una habitación con ese número en este hotel"
 */
router.post('/', habitacionController.crear);

/**
 * @swagger
 * /api/habitaciones:
 *   get:
 *     summary: Listar habitaciones con filtros opcionales
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: number
 *         description: Filtrar por hotel
 *       - in: query
 *         name: tipoHabitacionId
 *         schema:
 *           type: number
 *         description: Filtrar por tipo de habitación
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [DISPONIBLE, OCUPADA, MANTENIMIENTO, LIMPIEZA, BLOQUEADA]
 *         description: Filtrar por estado
 *       - in: query
 *         name: piso
 *         schema:
 *           type: number
 *         description: Filtrar por piso
 *       - in: query
 *         name: numeroHabitacion
 *         schema:
 *           type: string
 *         description: Buscar por número de habitación (búsqueda parcial)
 *       - in: query
 *         name: capacidadMinima
 *         schema:
 *           type: number
 *         description: Capacidad mínima de adultos
 *     responses:
 *       200:
 *         description: Lista de habitaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Habitacion'
 */
router.get('/', habitacionController.listar);

/**
 * @swagger
 * /api/habitaciones/{id}:
 *   get:
 *     summary: Obtener habitación por ID
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la habitación
 *     responses:
 *       200:
 *         description: Datos de la habitación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Habitacion'
 *       404:
 *         description: Habitación no encontrada
 */
router.get('/:id', habitacionController.obtenerPorId);

/**
 * @swagger
 * /api/habitaciones/{id}:
 *   put:
 *     summary: Actualizar habitación
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la habitación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipoHabitacionId:
 *                 type: number
 *                 example: 2
 *               numeroHabitacion:
 *                 type: string
 *                 example: "301"
 *               piso:
 *                 type: number
 *                 example: 3
 *               vista:
 *                 type: string
 *                 example: "Mar"
 *               estado:
 *                 type: string
 *                 example: "DISPONIBLE"
 *               observaciones:
 *                 type: string
 *                 example: "Habitación actualizada"
 *     responses:
 *       200:
 *         description: Habitación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Habitacion'
 *                 message:
 *                   type: string
 *                   example: "Habitación actualizada exitosamente"
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Habitación no encontrada
 */
router.put('/:id', habitacionController.actualizar);

/**
 * @swagger
 * /api/habitaciones/{id}:
 *   delete:
 *     summary: Eliminar/Bloquear habitación
 *     tags: [Habitaciones]
 *     description: Bloquea la habitación (no la elimina físicamente). No se puede eliminar si tiene reservas futuras.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la habitación
 *     responses:
 *       200:
 *         description: Habitación bloqueada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Habitación eliminada exitosamente"
 *       400:
 *         description: No se puede eliminar (tiene reservas futuras)
 */
router.delete('/:id', habitacionController.eliminar);

/**
 * @swagger
 * /api/habitaciones/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de habitación
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la habitación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EstadoUpdate'
 *     responses:
 *       200:
 *         description: Estado actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Habitacion'
 *                 message:
 *                   type: string
 *                   example: "Estado actualizado exitosamente"
 *       400:
 *         description: Estado inválido o transición no permitida
 */
router.patch('/:id/estado', habitacionController.cambiarEstado);

/**
 * @swagger
 * /api/habitaciones/{id}/ocupada:
 *   get:
 *     summary: Verificar si habitación está ocupada
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la habitación
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicio (YYYY-MM-DD)
 *         example: "2025-01-15"
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha fin (YYYY-MM-DD)
 *         example: "2025-01-20"
 *     responses:
 *       200:
 *         description: Estado de ocupación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     habitacionId:
 *                       type: number
 *                       example: 15
 *                     ocupada:
 *                       type: boolean
 *                       example: false
 *                     estado:
 *                       type: string
 *                       example: "DISPONIBLE"
 */
router.get('/:id/ocupada', habitacionController.verificarOcupacion);

/**
 * @swagger
 * /api/habitaciones/hotel/{hotelId}/disponibles:
 *   get:
 *     summary: Buscar habitaciones disponibles para fechas específicas
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID del hotel
 *       - in: query
 *         name: fechaCheckin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de check-in (YYYY-MM-DD)
 *         example: "2025-01-15"
 *       - in: query
 *         name: fechaCheckout
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de check-out (YYYY-MM-DD)
 *         example: "2025-01-20"
 *       - in: query
 *         name: capacidadAdultos
 *         schema:
 *           type: number
 *           default: 1
 *         description: Capacidad mínima de adultos
 *         example: 2
 *     responses:
 *       200:
 *         description: Lista de habitaciones disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 8
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Habitacion'
 *       400:
 *         description: Faltan parámetros requeridos
 */
router.get('/hotel/:hotelId/disponibles', habitacionController.obtenerDisponibles);

/**
 * @swagger
 * /api/habitaciones/{id}/mantenimiento/iniciar:
 *   post:
 *     summary: Iniciar mantenimiento en habitación
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la habitación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MantenimientoInput'
 *     responses:
 *       200:
 *         description: Mantenimiento iniciado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Habitacion'
 *                 message:
 *                   type: string
 *                   example: "Mantenimiento iniciado exitosamente"
 *       400:
 *         description: No se puede iniciar mantenimiento (habitación ocupada)
 */
router.post('/:id/mantenimiento/iniciar', habitacionController.iniciarMantenimiento);

/**
 * @swagger
 * /api/habitaciones/{id}/mantenimiento/finalizar:
 *   post:
 *     summary: Finalizar mantenimiento
 *     tags: [Habitaciones]
 *     description: Cambia el estado de MANTENIMIENTO a LIMPIEZA
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: ID de la habitación
 *     responses:
 *       200:
 *         description: Mantenimiento finalizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Habitacion'
 *                 message:
 *                   type: string
 *                   example: "Mantenimiento finalizado exitosamente"
 *       400:
 *         description: La habitación no está en mantenimiento
 */
router.post('/:id/mantenimiento/finalizar', habitacionController.finalizarMantenimiento);

/**
 * @swagger
 * /api/habitaciones/hotel/{hotelId}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de ocupación del hotel
 *     tags: [Habitaciones]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: number
 *         description: ID del hotel
 *     responses:
 *       200:
 *         description: Estadísticas de habitaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Estadisticas'
 *             example:
 *               success: true
 *               data:
 *                 TOTAL_HABITACIONES: 50
 *                 DISPONIBLES: 28
 *                 OCUPADAS: 18
 *                 EN_LIMPIEZA: 2
 *                 EN_MANTENIMIENTO: 1
 *                 BLOQUEADAS: 1
 *                 PORCENTAJE_OCUPACION: 36.00
 */
router.get('/hotel/:hotelId/estadisticas', habitacionController.obtenerEstadisticas);

module.exports = router;