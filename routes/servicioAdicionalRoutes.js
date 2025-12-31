// routes/servicioAdicionalRoutes.js
const express = require('express');
const router = express.Router();
const servicioAdicionalController = require('../controllers/servicioAdicionalController');
const verificarToken = require('../middleware/verificarToken');

/**
 * @swagger
 * components:
 *   schemas:
 *     ServicioAdicional:
 *       type: object
 *       properties:
 *         servicioId:
 *           type: integer
 *         hotelId:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         categoria:
 *           type: string
 *           example: SPA
 *         precio:
 *           type: number
 *         moneda:
 *           type: string
 *           default: USD
 *         unidad:
 *           type: string
 *           example: SERVICIO
 *         estado:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
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
 *     ServicioAdicionalInput:
 *       type: object
 *       required:
 *         - hotelId
 *         - nombre
 *         - precio
 *       properties:
 *         hotelId:
 *           type: integer
 *         nombre:
 *           type: string
 *           example: Desayuno Buffet
 *         descripcion:
 *           type: string
 *           example: Desayuno continental completo
 *         categoria:
 *           type: string
 *           example: ALIMENTOS
 *         precio:
 *           type: number
 *           example: 15.00
 *         moneda:
 *           type: string
 *           default: USD
 *         unidad:
 *           type: string
 *           example: PERSONA
 */

/**
 * @swagger
 * /api/servicios-adicionales:
 *   get:
 *     summary: Listar servicios adicionales con filtros opcionales
 *     tags: [Servicios Adicionales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de hotel
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre (búsqueda parcial)
 *       - in: query
 *         name: soloActivos
 *         schema:
 *           type: boolean
 *         description: Solo servicios activos
 *     responses:
 *       200:
 *         description: Lista de servicios adicionales
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
 *                     $ref: '#/components/schemas/ServicioAdicional'
 *                 count:
 *                   type: integer
 */
router.get('/', verificarToken, servicioAdicionalController.listar);

/**
 * @swagger
 * /api/servicios-adicionales/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de servicios adicionales
 *     tags: [Servicios Adicionales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: integer
 *         description: Filtrar por hotel (opcional)
 *     responses:
 *       200:
 *         description: Estadísticas de servicios
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
 *                       totalServicios:
 *                         type: integer
 *                       activos:
 *                         type: integer
 *                       inactivos:
 *                         type: integer
 *                       categoriasDiferentes:
 *                         type: integer
 *                       categoria:
 *                         type: string
 *                       cantidadPorCategoria:
 *                         type: integer
 *                       precioPromedio:
 *                         type: number
 *                       precioMinimo:
 *                         type: number
 *                       precioMaximo:
 *                         type: number
 */
router.get('/estadisticas', verificarToken, servicioAdicionalController.obtenerEstadisticas);

/**
 * @swagger
 * /api/servicios-adicionales/{id}:
 *   get:
 *     summary: Obtener servicio adicional por ID
 *     tags: [Servicios Adicionales]
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
 *         description: Servicio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ServicioAdicional'
 *       404:
 *         description: Servicio no encontrado
 */
router.get('/:id', verificarToken, servicioAdicionalController.obtenerPorId);

/**
 * @swagger
 * /api/servicios-adicionales:
 *   post:
 *     summary: Crear un nuevo servicio adicional
 *     tags: [Servicios Adicionales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServicioAdicionalInput'
 *           examples:
 *             desayuno:
 *               summary: Desayuno
 *               value:
 *                 hotelId: 1
 *                 nombre: Desayuno Buffet
 *                 descripcion: Desayuno continental completo
 *                 categoria: ALIMENTOS
 *                 precio: 15.00
 *                 moneda: USD
 *                 unidad: PERSONA
 *             spa:
 *               summary: Spa
 *               value:
 *                 hotelId: 1
 *                 nombre: Masaje Relajante
 *                 descripcion: Masaje de 60 minutos
 *                 categoria: SPA
 *                 precio: 80.00
 *                 moneda: USD
 *                 unidad: SESION
 *             transporte:
 *               summary: Transporte
 *               value:
 *                 hotelId: 1
 *                 nombre: Transfer Aeropuerto
 *                 descripcion: Transporte desde/hacia aeropuerto
 *                 categoria: TRANSPORTE
 *                 precio: 25.00
 *                 moneda: USD
 *                 unidad: TRAYECTO
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ServicioAdicional'
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verificarToken, servicioAdicionalController.crear);

/**
 * @swagger
 * /api/servicios-adicionales/{id}:
 *   put:
 *     summary: Actualizar servicio adicional
 *     tags: [Servicios Adicionales]
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
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *               precio:
 *                 type: number
 *               moneda:
 *                 type: string
 *               unidad:
 *                 type: string
 *     responses:
 *       200:
 *         description: Servicio actualizado
 *       404:
 *         description: Servicio no encontrado
 */
router.put('/:id', verificarToken, servicioAdicionalController.actualizar);

/**
 * @swagger
 * /api/servicios-adicionales/{id}/estado:
 *   patch:
 *     summary: Cambiar estado del servicio
 *     tags: [Servicios Adicionales]
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
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *           example:
 *             estado: ACTIVO
 *     responses:
 *       200:
 *         description: Estado cambiado exitosamente
 *       400:
 *         description: Estado inválido
 */
router.patch('/:id/estado', verificarToken, servicioAdicionalController.cambiarEstado);

/**
 * @swagger
 * /api/servicios-adicionales/{id}/activar:
 *   patch:
 *     summary: Activar servicio adicional
 *     tags: [Servicios Adicionales]
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
 *         description: Servicio activado exitosamente
 */
router.patch('/:id/activar', verificarToken, servicioAdicionalController.activar);

/**
 * @swagger
 * /api/servicios-adicionales/{id}/desactivar:
 *   patch:
 *     summary: Desactivar servicio adicional
 *     tags: [Servicios Adicionales]
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
 *         description: Servicio desactivado exitosamente
 */
router.patch('/:id/desactivar', verificarToken, servicioAdicionalController.desactivar);

/**
 * @swagger
 * /api/servicios-adicionales/{id}:
 *   delete:
 *     summary: Eliminar servicio adicional (solo si no está en uso)
 *     tags: [Servicios Adicionales]
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
 *         description: Servicio eliminado exitosamente
 *       400:
 *         description: Servicio está en uso y no puede ser eliminado
 *       404:
 *         description: Servicio no encontrado
 */
router.delete('/:id', verificarToken, servicioAdicionalController.eliminar);

module.exports = router;