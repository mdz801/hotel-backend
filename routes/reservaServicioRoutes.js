const express = require('express');
const router = express.Router();
const reservaServicioController = require('../controllers/reservaServicioController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReservaServicio:
 *       type: object
 *       properties:
 *         reserva_servicio_id: { type: integer, example: 1 }
 *         reserva_id: { type: integer, example: 5 }
 *         servicio_id: { type: integer, example: 3 }
 *         cantidad: { type: integer, example: 2 }
 *         precio_unitario: { type: number, example: 50.00 }
 *         subtotal: { type: number, example: 100.00 }
 *         fecha_servicio: { type: string, format: date-time }
 *         estado: { type: string, enum: [PENDIENTE, CONFIRMADO, COMPLETADO, CANCELADO] }
 *         fecha_creacion: { type: string, format: date-time }
 *         usuario_creacion: { type: string }
 */

/**
 * @swagger
 * /api/reservas-servicios:
 *   post:
 *     summary: Agregar servicio a reserva
 *     tags: [Reserva Servicios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reserva_id, servicio_id]
 *             properties:
 *               reserva_id: { type: integer, example: 5 }
 *               servicio_id: { type: integer, example: 3 }
 *               cantidad: { type: integer, example: 2 }
 *               fecha_servicio: { type: string, format: date, example: "2025-01-15" }
 *     responses:
 *       201: { description: Servicio agregado }
 *       400: { description: Datos inválidos }
 */
router.post('/', reservaServicioController.agregarServicio.bind(reservaServicioController));

/**
 * @swagger
 * /api/reservas-servicios/{id}:
 *   get:
 *     summary: Obtener servicio por ID
 *     tags: [Reserva Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Servicio encontrado }
 *       404: { description: No encontrado }
 */
router.get('/:id', reservaServicioController.obtenerPorId.bind(reservaServicioController));

/**
 * @swagger
 * /api/reservas-servicios/reserva/{reserva_id}:
 *   get:
 *     summary: Listar servicios de una reserva
 *     tags: [Reserva Servicios]
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de servicios }
 */
router.get('/reserva/:reserva_id', reservaServicioController.listarPorReserva.bind(reservaServicioController));

/**
 * @swagger
 * /api/reservas-servicios/{id}/estado:
 *   put:
 *     summary: Actualizar estado del servicio
 *     tags: [Reserva Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado: { type: string, enum: [PENDIENTE, CONFIRMADO, COMPLETADO, CANCELADO] }
 *     responses:
 *       200: { description: Estado actualizado }
 */
router.put('/:id/estado', reservaServicioController.actualizarEstado.bind(reservaServicioController));

/**
 * @swagger
 * /api/reservas-servicios/{id}/cantidad:
 *   put:
 *     summary: Actualizar cantidad del servicio
 *     tags: [Reserva Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cantidad]
 *             properties:
 *               cantidad: { type: integer, minimum: 1, example: 3 }
 *     responses:
 *       200: { description: Cantidad actualizada }
 */
router.put('/:id/cantidad', reservaServicioController.actualizarCantidad.bind(reservaServicioController));

/**
 * @swagger
 * /api/reservas-servicios/{id}/cancelar:
 *   put:
 *     summary: Cancelar servicio
 *     tags: [Reserva Servicios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Servicio cancelado }
 */
router.put('/:id/cancelar', reservaServicioController.cancelarServicio.bind(reservaServicioController));

/**
 * @swagger
 * /api/reservas-servicios/reserva/{reserva_id}/total:
 *   get:
 *     summary: Calcular total de servicios de una reserva
 *     tags: [Reserva Servicios]
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Total calculado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     reserva_id: { type: integer }
 *                     total_servicios: { type: number }
 */
router.get('/reserva/:reserva_id/total', reservaServicioController.calcularTotalReserva.bind(reservaServicioController));

/**
 * @swagger
 * /api/reservas-servicios/reserva/{reserva_id}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de servicios por reserva
 *     tags: [Reserva Servicios]
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Estadísticas por categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       categoria: { type: string }
 *                       total_servicios: { type: integer }
 *                       total_monto: { type: number }
 */
router.get('/reserva/:reserva_id/estadisticas', reservaServicioController.obtenerEstadisticas.bind(reservaServicioController));

module.exports = router;