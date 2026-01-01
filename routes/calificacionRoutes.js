const express = require('express');
const router = express.Router();
const calificacionController = require('../controllers/calificacionController');
const verificarToken = require('../middleware/verificarToken');
const { verificarRol } = require('../middleware/verificarRol');

router.use(verificarToken);

/**
 * @swagger
 * /api/calificaciones/hotel/{hotelId}:
 *   get:
 *     summary: Listar calificaciones de un hotel
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: puntuacion_minima
 *         schema:
 *           type: number
 *         example: 3
 *     responses:
 *       200:
 *         description: Lista de calificaciones
 */
router.get('/hotel/:hotelId', calificacionController.listarPorHotel);

/**
 * @swagger
 * /api/calificaciones/hotel/{hotelId}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de calificaciones de un hotel
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Estadísticas completas
 */
router.get('/hotel/:hotelId/estadisticas', calificacionController.obtenerEstadisticas);

/**
 * @swagger
 * /api/calificaciones/{id}:
 *   get:
 *     summary: Obtener calificación por ID
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Calificación encontrada
 */
router.get('/:id', calificacionController.obtenerPorId);

/**
 * @swagger
 * /api/calificaciones/{id}/responder:
 *   post:
 *     summary: Responder a una calificación
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - respuesta_hotel
 *             properties:
 *               respuesta_hotel:
 *                 type: string
 *                 example: "Agradecemos sus comentarios. Hemos tomado nota para mejorar."
 *     responses:
 *       200:
 *         description: Respuesta registrada
 */
router.post('/:id/responder', verificarRol(['ADMIN', 'GERENTE']), calificacionController.responder);

/**
 * @swagger
 * /api/calificaciones/{id}:
 *   delete:
 *     summary: Eliminar calificación
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Calificación eliminada
 */
router.delete('/:id', verificarRol(['ADMIN']), calificacionController.eliminar);

module.exports = router;