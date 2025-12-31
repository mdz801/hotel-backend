// routes/reservaRoutes.js
const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const verificarToken = require('../middleware/verificarToken');
const { verificarRol } = require('../middleware/verificarRol');

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     tags: [Reservas]
 *     summary: Listar reservas con filtros
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: huespedId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: codigoReserva
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de reservas
 */
router.get('/', verificarToken, reservaController.listar);

// Disponibilidad (rutas específicas antes de :id)
/**
 * @swagger
 * /api/reservas/disponibilidad:
 *   get:
 *     tags: [Reservas]
 *     summary: Verificar disponibilidad de una habitación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: habitacionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fechaCheckin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaCheckout
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Disponibilidad verificada
 */
router.get('/disponibilidad', verificarToken, reservaController.verificarDisponibilidad);

/**
 * @swagger
 * /api/reservas/buscar-habitaciones:
 *   get:
 *     tags: [Reservas]
 *     summary: Buscar habitaciones disponibles en un hotel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: fechaCheckin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: fechaCheckout
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: capacidadAdultos
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de habitaciones disponibles
 */
router.get('/buscar-habitaciones', verificarToken, reservaController.buscarHabitacionesDisponibles);

// Rutas con ID
/**
 * @swagger
 * /api/reservas/{id}:
 *   get:
 *     tags: [Reservas]
 *     summary: Obtener reserva por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva encontrada
 */
router.get('/:id', verificarToken, reservaController.obtenerPorId);

/**
 * @swagger
 * /api/reservas:
 *   post:
 *     tags: [Reservas]
 *     summary: Crear nueva reserva
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
 *               - huespedId
 *               - fechaCheckin
 *               - fechaCheckout
 *               - numeroAdultos
 *               - subtotal
 *               - impuestos
 *               - total
 *               - habitaciones
 *             properties:
 *               hotelId:
 *                 type: integer
 *               huespedId:
 *                 type: integer
 *               fechaCheckin:
 *                 type: string
 *                 format: date
 *               fechaCheckout:
 *                 type: string
 *                 format: date
 *               numeroAdultos:
 *                 type: integer
 *               numeroNinos:
 *                 type: integer
 *                 default: 0
 *               subtotal:
 *                 type: number
 *                 format: float
 *               descuento:
 *                 type: number
 *                 format: float
 *               impuestos:
 *                 type: number
 *                 format: float
 *               total:
 *                 type: number
 *                 format: float
 *               moneda:
 *                 type: string
 *               politicaCancelacionId:
 *                 type: integer
 *               observaciones:
 *                 type: string
 *               codigoReserva:
 *                 type: string
 *               habitaciones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - habitacionId
 *                     - tarifaAplicada
 *                   properties:
 *                     habitacionId:
 *                       type: integer
 *                     tarifaAplicada:
 *                       type: number
 *                       format: float
 *           example:
 *             hotelId: 1
 *             huespedId: 123
 *             fechaCheckin: "2026-01-10"
 *             fechaCheckout: "2026-01-15"
 *             numeroAdultos: 2
 *             numeroNinos: 0
 *             subtotal: 500.00
 *             descuento: 0.00
 *             impuestos: 90.00
 *             total: 590.00
 *             moneda: "USD"
 *             politicaCancelacionId: null
 *             observaciones: "Llegada tarde aprox 22:00"
 *             habitaciones:
 *               - habitacionId: 101
 *                 tarifaAplicada: 100.00
 *               - habitacionId: 102
 *                 tarifaAplicada: 150.00
 *     responses:
 *       201:
 *         description: Reserva creada
 */
router.post('/', verificarToken, verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA'), reservaController.crear);

/**
 * @swagger
 * /api/reservas/{id}:
 *   put:
 *     tags: [Reservas]
 *     summary: Actualizar reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Reserva actualizada
 */
router.put('/:id', verificarToken, verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA'), reservaController.actualizar);

// Cambios de estado
/**
 * @swagger
 * /api/reservas/{id}/confirmar:
 *   patch:
 *     tags: [Reservas]
 *     summary: Confirmar una reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva confirmada
 */
router.patch('/:id/confirmar', verificarToken, verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA'), reservaController.confirmar);

/**
 * @swagger
 * /api/reservas/{id}/cancelar:
 *   patch:
 *     tags: [Reservas]
 *     summary: Cancelar una reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reserva cancelada
 */
router.patch('/:id/cancelar', verificarToken, verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA'), reservaController.cancelar);

/**
 * @swagger
 * /api/reservas/{id}/checkin:
 *   patch:
 *     tags: [Reservas]
 *     summary: Registrar check-in de una reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check-in realizado
 */
router.patch('/:id/checkin', verificarToken, verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA'), reservaController.checkin);

/**
 * @swagger
 * /api/reservas/{id}/checkout:
 *   patch:
 *     tags: [Reservas]
 *     summary: Registrar check-out de una reserva
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check-out realizado
 */
router.patch('/:id/checkout', verificarToken, verificarRol('ADMIN', 'GERENTE', 'RECEPCIONISTA'), reservaController.checkout);

module.exports = router;
