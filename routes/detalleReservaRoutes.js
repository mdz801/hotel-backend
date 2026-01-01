// routes/detalleReservaRoutes.js
const express = require('express');
const router = express.Router();
const detalleReservaController = require('../controllers/detalleReservaController');
const verificarToken = require('../middleware/verificarToken');

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleReserva:
 *       type: object
 *       properties:
 *         detalleId:
 *           type: integer
 *         reservaId:
 *           type: integer
 *         habitacionId:
 *           type: integer
 *         tarifaAplicada:
 *           type: number
 *         numeroNoches:
 *           type: integer
 *         subtotal:
 *           type: number
 *         codigoReserva:
 *           type: string
 *         numeroHabitacion:
 *           type: string
 *         tipoHabitacion:
 *           type: string
 *         nombreHotel:
 *           type: string
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *         usuarioCreacion:
 *           type: string
 *         fechaModificacion:
 *           type: string
 *           format: date-time
 *         usuarioModificacion:
 *           type: string
 *     DetalleReservaInput:
 *       type: object
 *       required:
 *         - reservaId
 *         - habitacionId
 *         - tarifaAplicada
 *         - numeroNoches
 *       properties:
 *         reservaId:
 *           type: integer
 *           example: 1
 *         habitacionId:
 *           type: integer
 *           example: 101
 *         tarifaAplicada:
 *           type: number
 *           example: 150.00
 *         numeroNoches:
 *           type: integer
 *           example: 3
 */

/**
 * @swagger
 * /api/detalles-reserva:
 *   get:
 *     summary: Listar detalles de reserva con filtros opcionales
 *     tags: [Detalles Reserva]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reservaId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de reserva
 *     responses:
 *       200:
 *         description: Lista de detalles
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
 *                     $ref: '#/components/schemas/DetalleReserva'
 *                 count:
 *                   type: integer
 */
router.get('/', verificarToken, detalleReservaController.listar);

/**
 * @swagger
 * /api/detalles-reserva/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de detalles de reserva
 *     tags: [Detalles Reserva]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reservaId
 *         schema:
 *           type: integer
 *         description: Filtrar por reserva (opcional)
 *     responses:
 *       200:
 *         description: Estadísticas de detalles
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
 *                     type: object
 *                     properties:
 *                       totalDetalles:
 *                         type: integer
 *                       totalReservas:
 *                         type: integer
 *                       habitacionesDiferentes:
 *                         type: integer
 *                       totalIngresos:
 *                         type: number
 *                       tarifaPromedio:
 *                         type: number
 *                       nochesPromedio:
 *                         type: number
 *                       tipoHabitacionMasReservado:
 *                         type: string
 *                       vecesReservado:
 *                         type: integer
 */
router.get('/estadisticas', verificarToken, detalleReservaController.obtenerEstadisticas);

/**
 * @swagger
 * /api/detalles-reserva/reserva/{reservaId}/total:
 *   get:
 *     summary: Calcular total de habitaciones de una reserva
 *     tags: [Detalles Reserva]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Total calculado
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
 *                     reservaId:
 *                       type: integer
 *                     totalHabitaciones:
 *                       type: number
 *                     cantidadHabitaciones:
 *                       type: integer
 *                     detalles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DetalleReserva'
 */
router.get('/reserva/:reservaId/total', verificarToken, detalleReservaController.calcularTotalReserva);

/**
 * @swagger
 * /api/detalles-reserva/{id}:
 *   get:
 *     summary: Obtener detalle de reserva por ID
 *     tags: [Detalles Reserva]
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
 *         description: Detalle encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DetalleReserva'
 *       404:
 *         description: Detalle no encontrado
 */
router.get('/:id', verificarToken, detalleReservaController.obtenerPorId);

/**
 * @swagger
 * /api/detalles-reserva/{id}/subtotal:
 *   get:
 *     summary: Calcular subtotal de un detalle
 *     tags: [Detalles Reserva]
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
 *         description: Subtotal calculado
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
 *                     detalleId:
 *                       type: integer
 *                     subtotal:
 *                       type: number
 */
router.get('/:id/subtotal', verificarToken, detalleReservaController.calcularSubtotal);

/**
 * @swagger
 * /api/detalles-reserva:
 *   post:
 *     summary: Agregar habitación a una reserva
 *     tags: [Detalles Reserva]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DetalleReservaInput'
 *           example:
 *             reservaId: 1
 *             habitacionId: 101
 *             tarifaAplicada: 150.00
 *             numeroNoches: 3
 *     responses:
 *       201:
 *         description: Habitación agregada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DetalleReserva'
 *       400:
 *         description: Datos inválidos o habitación no disponible
 */
router.post('/', verificarToken, detalleReservaController.agregar);

/**
 * @swagger
 * /api/detalles-reserva/{id}:
 *   put:
 *     summary: Actualizar detalle de reserva
 *     tags: [Detalles Reserva]
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
 *               tarifaAplicada:
 *                 type: number
 *               numeroNoches:
 *                 type: integer
 *           example:
 *             tarifaAplicada: 180.00
 *             numeroNoches: 5
 *     responses:
 *       200:
 *         description: Detalle actualizado (recalcula subtotal automáticamente)
 *       404:
 *         description: Detalle no encontrado
 */
router.put('/:id', verificarToken, detalleReservaController.actualizar);

/**
 * @swagger
 * /api/detalles-reserva/{id}:
 *   delete:
 *     summary: Eliminar detalle de reserva (quitar habitación)
 *     tags: [Detalles Reserva]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Detalle eliminado exitosamente
 *       404:
 *         description: Detalle no encontrado
 */
router.delete('/:id', verificarToken, detalleReservaController.eliminar);

module.exports = router;