const express = require('express');
const router = express.Router();
const puntosFidelizacionController = require('../controllers/puntosFidelizacionController');
// const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Puntos Fidelización
 *   description: Gestión de puntos de fidelización de huéspedes
 */

/**
 * @swagger
 * /api/puntos-fidelizacion/saldo/{huespedId}:
 *   get:
 *     summary: Obtener saldo de puntos de un huésped
 *     tags: [Puntos Fidelización]
 *     parameters:
 *       - in: path
 *         name: huespedId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saldo obtenido correctamente
 */
router.get(
  '/saldo/:huespedId',
  // authMiddleware,
  puntosFidelizacionController.obtenerSaldo
);

/**
 * @swagger
 * /api/puntos-fidelizacion/acumular:
 *   post:
 *     summary: Acumular puntos a un huésped
 *     tags: [Puntos Fidelización]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - huespedId
 *               - puntos
 *               - descripcion
 *               - reservaId
 *               - habitacionId
 *               - tarifaAplicada
 *               - numeroNoches
 *             properties:
 *               huespedId:
 *                 type: string
 *               puntos:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *               reservaId:
 *                 type: string
 *               habitacionId:
 *                 type: string
 *               tarifaAplicada:
 *                 type: number
 *               numeroNoches:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Puntos acumulados correctamente
 */
router.post(
  '/acumular',
  // authMiddleware,
  puntosFidelizacionController.acumularPuntos
);

/**
 * @swagger
 * /api/puntos-fidelizacion/canjear:
 *   post:
 *     summary: Canjear puntos de un huésped
 *     tags: [Puntos Fidelización]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - huespedId
 *               - puntos
 *               - descripcion
 *             properties:
 *               huespedId:
 *                 type: string
 *               puntos:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *               reservaId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Puntos canjeados correctamente
 */
router.post(
  '/canjear',
  // authMiddleware,
  puntosFidelizacionController.canjearPuntos
);

/**
 * @swagger
 * /api/puntos-fidelizacion/ajustar:
 *   post:
 *     summary: Ajustar puntos manualmente
 *     tags: [Puntos Fidelización]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - huespedId
 *               - puntos
 *               - descripcion
 *             properties:
 *               huespedId:
 *                 type: string
 *               puntos:
 *                 type: integer
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ajuste realizado correctamente
 */
router.post(
  '/ajustar',
  // authMiddleware,
  puntosFidelizacionController.ajustarPuntos
);

/**
 * @swagger
 * /api/puntos-fidelizacion/transacciones/{huespedId}:
 *   get:
 *     summary: Listar transacciones de puntos
 *     tags: [Puntos Fidelización]
 *     parameters:
 *       - in: path
 *         name: huespedId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de transacciones
 */
router.get(
  '/transacciones/:huespedId',
  // authMiddleware,
  puntosFidelizacionController.listarTransacciones
);

/**
 * @swagger
 * /api/puntos-fidelizacion/transaccion/{id}:
 *   get:
 *     summary: Obtener una transacción específica
 *     tags: [Puntos Fidelización]
 */
router.get(
  '/transaccion/:id',
  // authMiddleware,
  puntosFidelizacionController.obtenerTransaccion
);

/**
 * @swagger
 * /api/puntos-fidelizacion/transaccion/{id}:
 *   delete:
 *     summary: Eliminar una transacción
 *     tags: [Puntos Fidelización]
 */
router.delete(
  '/transaccion/:id',
  // authMiddleware,
  puntosFidelizacionController.eliminarTransaccion
);

/**
 * @swagger
 * /api/puntos-fidelizacion/estadisticas/{huespedId}:
 *   get:
 *     summary: Obtener estadísticas de puntos
 *     tags: [Puntos Fidelización]
 */
router.get(
  '/estadisticas/:huespedId',
  // authMiddleware,
  puntosFidelizacionController.obtenerEstadisticas
);

/**
 * @swagger
 * /api/puntos-fidelizacion/por-expirar/{huespedId}:
 *   get:
 *     summary: Obtener puntos por expirar
 *     tags: [Puntos Fidelización]
 */
router.get(
  '/por-expirar/:huespedId',
  // authMiddleware,
  puntosFidelizacionController.obtenerPuntosPorExpirar
);

/**
 * @swagger
 * /api/puntos-fidelizacion/expirar:
 *   post:
 *     summary: Expirar puntos (global o por huésped)
 *     tags: [Puntos Fidelización]
 */
router.post(
  '/expirar',
  // authMiddleware,
  puntosFidelizacionController.expirarPuntos
);

/**
 * @swagger
 * /api/puntos-fidelizacion/verificar/{huespedId}:
 *   get:
 *     summary: Verificar si un huésped tiene puntos suficientes
 *     tags: [Puntos Fidelización]
 */
router.get(
  '/verificar/:huespedId',
  // authMiddleware,
  puntosFidelizacionController.verificarPuntosSuficientes
);

/**
 * @swagger
 * /api/puntos-fidelizacion/calcular/{huespedId}:
 *   get:
 *     summary: Calcular puntos por monto de reserva
 *     tags: [Puntos Fidelización]
 */
router.get(
  '/calcular/:huespedId',
  // authMiddleware,
  puntosFidelizacionController.calcularPuntosReserva
);

module.exports = router;
