const express = require('express');
const router = express.Router();
const politicaCancelacionController = require('../controllers/politicaCancelacionController');
const verificarToken = require('../middleware/verificarToken');
const { verificarRol } = require('../middleware/verificarRol');

router.use(verificarToken);

/**
 * @swagger
 * /api/politicas-cancelacion:
 *   post:
 *     summary: Crear política de cancelación
 *     tags: [Políticas Cancelación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - dias_antes_checkin
 *               - porcentaje_penalidad
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Flexible"
 *               descripcion:
 *                 type: string
 *                 example: "Cancelación gratuita hasta 7 días antes"
 *               dias_antes_checkin:
 *                 type: integer
 *                 example: 7
 *               porcentaje_penalidad:
 *                 type: number
 *                 example: 0
 *               permite_reembolso:
 *                 type: string
 *                 enum: [S, N]
 *                 example: "S"
 *     responses:
 *       201:
 *         description: Política creada
 */
router.post('/', verificarRol('ADMIN', 'GERENTE'), politicaCancelacionController.crear);

/**
 * @swagger
 * /api/politicas-cancelacion:
 *   get:
 *     summary: Listar todas las políticas
 *     tags: [Políticas Cancelación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de políticas
 */
router.get('/', politicaCancelacionController.listar);

/**
 * @swagger
 * /api/politicas-cancelacion/{id}:
 *   get:
 *     summary: Obtener política por ID
 *     tags: [Políticas Cancelación]
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
 *         description: Política encontrada
 */
router.get('/:id', politicaCancelacionController.obtenerPorId);

/**
 * @swagger
 * /api/politicas-cancelacion/{id}:
 *   put:
 *     summary: Actualizar política
 *     tags: [Políticas Cancelación]
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
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Moderada"
 *               descripcion:
 *                 type: string
 *               dias_antes_checkin:
 *                 type: integer
 *                 example: 14
 *               porcentaje_penalidad:
 *                 type: number
 *                 example: 50
 *               permite_reembolso:
 *                 type: string
 *                 enum: [S, N]
 *     responses:
 *       200:
 *         description: Política actualizada
 */
router.put('/:id', verificarRol('ADMIN', 'GERENTE'), politicaCancelacionController.actualizar);

/**
 * @swagger
 * /api/politicas-cancelacion/{id}:
 *   delete:
 *     summary: Eliminar política
 *     tags: [Políticas Cancelación]
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
 *         description: Política eliminada
 */
router.delete('/:id', verificarRol('ADMIN'), politicaCancelacionController.eliminar);

/**
 * @swagger
 * /api/politicas-cancelacion/{id}/calcular-penalidad:
 *   post:
 *     summary: Calcular penalidad de cancelación
 *     tags: [Políticas Cancelación]
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
 *               - total_reserva
 *               - dias_restantes
 *             properties:
 *               total_reserva:
 *                 type: number
 *                 example: 500
 *               dias_restantes:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Penalidad calculada
 */
router.post('/:id/calcular-penalidad', politicaCancelacionController.calcularPenalidad);

/**
 * @swagger
 * /api/politicas-cancelacion/{id}/puede-cancelar:
 *   post:
 *     summary: Verificar si puede cancelar
 *     tags: [Políticas Cancelación]
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
 *               - dias_restantes
 *             properties:
 *               dias_restantes:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Resultado de verificación
 */
router.post('/:id/puede-cancelar', politicaCancelacionController.puedeCancelar);

/**
 * @swagger
 * /api/politicas-cancelacion/verificar-nombre:
 *   post:
 *     summary: Verificar disponibilidad de nombre
 *     tags: [Políticas Cancelación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Estricta"
 *               politica_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Disponibilidad verificada
 */
router.post('/verificar-nombre', politicaCancelacionController.verificarNombreDisponible);

module.exports = router;