const express = require('express');
const router = express.Router();
const membresiaController = require('../controllers/membresiaController');
const verificarToken = require('../middleware/verificarToken');
const { verificarRol } = require('../middleware/verificarRol');

router.use(verificarToken);

/**
 * @swagger
 * /api/membresias:
 *   post:
 *     summary: Crear membresía
 *     tags: [Membresías]
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
 *               - nivel
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Gold"
 *               nivel:
 *                 type: integer
 *                 example: 3
 *               descuento_porcentaje:
 *                 type: number
 *                 example: 15
 *               puntos_por_dolar:
 *                 type: number
 *                 example: 5
 *               beneficios:
 *                 type: string
 *                 example: "Check-in prioritario, upgrade gratis sujeto a disponibilidad"
 *               puntos_minimos:
 *                 type: integer
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Membresía creada
 */
router.post('/', verificarRol(['ADMIN', 'GERENTE']), membresiaController.crear);

/**
 * @swagger
 * /api/membresias:
 *   get:
 *     summary: Listar todas las membresías
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de membresías
 */
router.get('/', membresiaController.listar);

/**
 * @swagger
 * /api/membresias/{id}:
 *   get:
 *     summary: Obtener membresía por ID
 *     tags: [Membresías]
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
 *         description: Membresía encontrada
 */
router.get('/:id', membresiaController.obtenerPorId);

/**
 * @swagger
 * /api/membresias/{id}:
 *   put:
 *     summary: Actualizar membresía
 *     tags: [Membresías]
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
 *               nivel:
 *                 type: integer
 *               descuento_porcentaje:
 *                 type: number
 *               puntos_por_dolar:
 *                 type: number
 *               beneficios:
 *                 type: string
 *               puntos_minimos:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Membresía actualizada
 */
router.put('/:id', verificarRol(['ADMIN', 'GERENTE']), membresiaController.actualizar);

/**
 * @swagger
 * /api/membresias/{id}:
 *   delete:
 *     summary: Eliminar membresía
 *     tags: [Membresías]
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
 *         description: Membresía eliminada
 */
router.delete('/:id', verificarRol(['ADMIN']), membresiaController.eliminar);

/**
 * @swagger
 * /api/membresias/{id}/calcular-descuento:
 *   post:
 *     summary: Calcular descuento según membresía
 *     tags: [Membresías]
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
 *               - monto_total
 *             properties:
 *               monto_total:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Descuento calculado
 */
router.post('/:id/calcular-descuento', membresiaController.calcularDescuento);

/**
 * @swagger
 * /api/membresias/{id}/calcular-puntos:
 *   post:
 *     summary: Calcular puntos ganados
 *     tags: [Membresías]
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
 *               - monto_gastado
 *             properties:
 *               monto_gastado:
 *                 type: number
 *                 example: 300
 *     responses:
 *       200:
 *         description: Puntos calculados
 */
router.post('/:id/calcular-puntos', membresiaController.calcularPuntosGanados);

/**
 * @swagger
 * /api/membresias/por-puntos:
 *   post:
 *     summary: Obtener membresía recomendada según puntos
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - puntos_acumulados
 *             properties:
 *               puntos_acumulados:
 *                 type: integer
 *                 example: 7500
 *     responses:
 *       200:
 *         description: Membresía recomendada
 */
router.post('/por-puntos', membresiaController.obtenerMembresiaPorPuntos);

/**
 * @swagger
 * /api/membresias/verificar-nombre:
 *   post:
 *     summary: Verificar disponibilidad de nombre
 *     tags: [Membresías]
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
 *                 example: "Platinum"
 *               membresia_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Disponibilidad verificada
 */
router.post('/verificar-nombre', membresiaController.verificarNombreDisponible);

/**
 * @swagger
 * /api/membresias/verificar-nivel:
 *   post:
 *     summary: Verificar disponibilidad de nivel
 *     tags: [Membresías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nivel
 *             properties:
 *               nivel:
 *                 type: integer
 *                 example: 4
 *               membresia_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Disponibilidad verificada
 */
router.post('/verificar-nivel', membresiaController.verificarNivelDisponible);

module.exports = router;