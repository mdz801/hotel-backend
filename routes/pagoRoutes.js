// routes/pagoRoutes.js
const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const verificarToken = require('../middleware/verificarToken');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pago:
 *       type: object
 *       properties:
 *         pagoId:
 *           type: integer
 *         reservaId:
 *           type: integer
 *         numeroTransaccion:
 *           type: string
 *         fechaPago:
 *           type: string
 *           format: date-time
 *         monto:
 *           type: number
 *         moneda:
 *           type: string
 *         metodoPago:
 *           type: string
 *         estado:
 *           type: string
 *           enum: [PENDIENTE, APROBADO, RECHAZADO, REEMBOLSADO]
 *         referenciaExterna:
 *           type: string
 *         descripcion:
 *           type: string
 *         codigoReserva:
 *           type: string
 *         totalReserva:
 *           type: number
 *         nombreHuesped:
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
 *     PagoInput:
 *       type: object
 *       required:
 *         - reservaId
 *         - monto
 *         - metodoPago
 *       properties:
 *         reservaId:
 *           type: integer
 *         monto:
 *           type: number
 *         moneda:
 *           type: string
 *           default: USD
 *         metodoPago:
 *           type: string
 *           example: TARJETA_CREDITO
 *         referenciaExterna:
 *           type: string
 *         descripcion:
 *           type: string
 */

/**
 * @swagger
 * /api/pagos:
 *   get:
 *     summary: Listar pagos con filtros opcionales
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reservaId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de reserva
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, APROBADO, RECHAZADO, REEMBOLSADO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: metodoPago
 *         schema:
 *           type: string
 *         description: Filtrar por método de pago
 *     responses:
 *       200:
 *         description: Lista de pagos
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
 *                     $ref: '#/components/schemas/Pago'
 *                 count:
 *                   type: integer
 */
router.get('/', verificarToken, pagoController.listar);

/**
 * @swagger
 * /api/pagos/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de pagos
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
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
 *     responses:
 *       200:
 *         description: Estadísticas de pagos
 */
router.get('/estadisticas', verificarToken, pagoController.obtenerEstadisticas);

/**
 * @swagger
 * /api/pagos/reserva/{reservaId}/resumen:
 *   get:
 *     summary: Obtener resumen de pagos de una reserva
 *     tags: [Pagos]
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
 *         description: Resumen de pagos
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
 *                     totalPagado:
 *                       type: number
 *                     saldoPendiente:
 *                       type: number
 *                     pagos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pago'
 *                     cantidadPagos:
 *                       type: integer
 */
router.get('/reserva/:reservaId/resumen', verificarToken, pagoController.obtenerResumenReserva);

/**
 * @swagger
 * /api/pagos/{id}:
 *   get:
 *     summary: Obtener pago por ID
 *     tags: [Pagos]
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
 *         description: Pago encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pago'
 *       404:
 *         description: Pago no encontrado
 */
router.get('/:id', verificarToken, pagoController.obtenerPorId);

/**
 * @swagger
 * /api/pagos:
 *   post:
 *     summary: Crear un nuevo pago
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagoInput'
 *           example:
 *             reservaId: 1
 *             monto: 250.00
 *             moneda: USD
 *             metodoPago: TARJETA_CREDITO
 *             referenciaExterna: TXN123456
 *             descripcion: Pago inicial 50%
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pago'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verificarToken, pagoController.crear);

/**
 * @swagger
 * /api/pagos/{id}:
 *   put:
 *     summary: Actualizar pago (solo si está PENDIENTE)
 *     tags: [Pagos]
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
 *               monto:
 *                 type: number
 *               metodoPago:
 *                 type: string
 *               referenciaExterna:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago actualizado
 *       400:
 *         description: No se puede actualizar (estado no es PENDIENTE)
 */
router.put('/:id', verificarToken, pagoController.actualizar);

/**
 * @swagger
 * /api/pagos/{id}/aprobar:
 *   patch:
 *     summary: Aprobar pago (PENDIENTE → APROBADO)
 *     tags: [Pagos]
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
 *         description: Pago aprobado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Pago'
 *                 message:
 *                   type: string
 *       400:
 *         description: Solo se pueden aprobar pagos PENDIENTES
 */
router.patch('/:id/aprobar', verificarToken, pagoController.aprobar);

/**
 * @swagger
 * /api/pagos/{id}/rechazar:
 *   patch:
 *     summary: Rechazar pago (PENDIENTE → RECHAZADO)
 *     tags: [Pagos]
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
 *         description: Pago rechazado exitosamente
 *       400:
 *         description: Solo se pueden rechazar pagos PENDIENTES
 */
router.patch('/:id/rechazar', verificarToken, pagoController.rechazar);

/**
 * @swagger
 * /api/pagos/{id}/reembolsar:
 *   patch:
 *     summary: Reembolsar pago (APROBADO → REEMBOLSADO)
 *     tags: [Pagos]
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
 *         description: Pago reembolsado exitosamente
 *       400:
 *         description: Solo se pueden reembolsar pagos APROBADOS
 */
router.patch('/:id/reembolsar', verificarToken, pagoController.reembolsar);

/**
 * @swagger
 * /api/pagos/{id}:
 *   delete:
 *     summary: Eliminar pago (solo si está PENDIENTE)
 *     tags: [Pagos]
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
 *         description: Pago eliminado exitosamente
 *       400:
 *         description: Solo se pueden eliminar pagos PENDIENTES
 */
router.delete('/:id', verificarToken, pagoController.eliminar);

module.exports = router;