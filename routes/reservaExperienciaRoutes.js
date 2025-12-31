const express = require('express');
const router = express.Router();
const reservaExperienciaController = require('../controllers/reservaExperienciaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReservaExperiencia:
 *       type: object
 *       properties:
 *         reserva_experiencia_id: { type: integer, example: 1 }
 *         reserva_id: { type: integer, example: 5 }
 *         experiencia_id: { type: integer, example: 3 }
 *         cantidad_personas: { type: integer, example: 2 }
 *         precio_por_persona: { type: number, example: 65.00 }
 *         subtotal: { type: number, example: 130.00 }
 *         fecha_hora_experiencia: { type: string, format: date-time }
 *         estado: { type: string, enum: [PENDIENTE, CONFIRMADO, COMPLETADO, CANCELADO] }
 *         fecha_creacion: { type: string, format: date-time }
 *         usuario_creacion: { type: string }
 */

/**
 * @swagger
 * /api/reservas-experiencias:
 *   post:
 *     summary: Agregar experiencia a reserva
 *     tags: [Reserva Experiencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reserva_id, experiencia_id]
 *             properties:
 *               reserva_id: { type: integer, example: 5 }
 *               experiencia_id: { type: integer, example: 3 }
 *               cantidad_personas: { type: integer, example: 2 }
 *               fecha_hora_experiencia: { type: string, format: date-time, example: "2025-01-15T10:00:00" }
 *     responses:
 *       201: { description: Experiencia agregada }
 *       400: { description: Datos inválidos }
 *       409: { description: Sin capacidad disponible }
 */
router.post('/', reservaExperienciaController.agregarExperiencia.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/{id}:
 *   get:
 *     summary: Obtener experiencia por ID
 *     tags: [Reserva Experiencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Experiencia encontrada }
 *       404: { description: No encontrada }
 */
router.get('/:id', reservaExperienciaController.obtenerPorId.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/reserva/{reserva_id}:
 *   get:
 *     summary: Listar experiencias de una reserva
 *     tags: [Reserva Experiencias]
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Lista de experiencias }
 */
router.get('/reserva/:reserva_id', reservaExperienciaController.listarPorReserva.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/{id}/estado:
 *   put:
 *     summary: Actualizar estado de la experiencia
 *     tags: [Reserva Experiencias]
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
router.put('/:id/estado', reservaExperienciaController.actualizarEstado.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/{id}/cantidad:
 *   put:
 *     summary: Actualizar cantidad de personas
 *     tags: [Reserva Experiencias]
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
 *             required: [cantidad_personas]
 *             properties:
 *               cantidad_personas: { type: integer, minimum: 1, example: 4 }
 *     responses:
 *       200: { description: Cantidad actualizada }
 *       409: { description: Excede capacidad máxima }
 */
router.put('/:id/cantidad', reservaExperienciaController.actualizarCantidad.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/{id}/fecha-hora:
 *   put:
 *     summary: Actualizar fecha y hora de la experiencia
 *     tags: [Reserva Experiencias]
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
 *             required: [fecha_hora_experiencia]
 *             properties:
 *               fecha_hora_experiencia: { type: string, format: date-time, example: "2025-01-20T14:00:00" }
 *     responses:
 *       200: { description: Fecha/hora actualizada }
 *       409: { description: Sin capacidad en ese horario }
 */
router.put('/:id/fecha-hora', reservaExperienciaController.actualizarFechaHora.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/{id}/cancelar:
 *   put:
 *     summary: Cancelar experiencia
 *     tags: [Reserva Experiencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Experiencia cancelada }
 */
router.put('/:id/cancelar', reservaExperienciaController.cancelarExperiencia.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/reserva/{reserva_id}/total:
 *   get:
 *     summary: Calcular total de experiencias de una reserva
 *     tags: [Reserva Experiencias]
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
 *                     total_experiencias: { type: number }
 */
router.get('/reserva/:reserva_id/total', reservaExperienciaController.calcularTotalReserva.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/reserva/{reserva_id}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de experiencias por reserva
 *     tags: [Reserva Experiencias]
 *     parameters:
 *       - in: path
 *         name: reserva_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Estadísticas de experiencias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_experiencias: { type: integer }
 *                     total_personas: { type: integer }
 *                     total_monto: { type: number }
 *                     promedio_monto: { type: number }
 */
router.get('/reserva/:reserva_id/estadisticas', reservaExperienciaController.obtenerEstadisticas.bind(reservaExperienciaController));

/**
 * @swagger
 * /api/reservas-experiencias/verificar-capacidad:
 *   post:
 *     summary: Verificar capacidad disponible para una experiencia
 *     tags: [Reserva Experiencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [experiencia_id, fecha_hora_experiencia, cantidad_personas]
 *             properties:
 *               experiencia_id: { type: integer, example: 3 }
 *               fecha_hora_experiencia: { type: string, format: date-time, example: "2025-01-15T10:00:00" }
 *               cantidad_personas: { type: integer, example: 4 }
 *     responses:
 *       200:
 *         description: Resultado de verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     disponible: { type: boolean }
 *                     mensaje: { type: string }
 */
router.post('/verificar-capacidad', reservaExperienciaController.verificarCapacidad.bind(reservaExperienciaController));

module.exports = router;