// routes/experienciaRoutes.js
const express = require('express');
const router = express.Router();
const experienciaController = require('../controllers/experienciaController');
const verificarToken = require('../middleware/verificarToken');

/**
 * @swagger
 * components:
 *   schemas:
 *     Experiencia:
 *       type: object
 *       properties:
 *         experienciaId:
 *           type: integer
 *         hotelId:
 *           type: integer
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         tipo:
 *           type: string
 *           example: TOUR
 *         duracionHoras:
 *           type: number
 *         capacidadMaxima:
 *           type: integer
 *         precioPersona:
 *           type: number
 *         incluye:
 *           type: string
 *         lugarSalida:
 *           type: string
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
 *     ExperienciaInput:
 *       type: object
 *       required:
 *         - hotelId
 *         - nombre
 *         - precioPersona
 *       properties:
 *         hotelId:
 *           type: integer
 *         nombre:
 *           type: string
 *           example: City Tour Lima
 *         descripcion:
 *           type: string
 *           example: Recorrido por los principales atractivos turísticos de Lima
 *         tipo:
 *           type: string
 *           example: TOUR
 *         duracionHoras:
 *           type: number
 *           example: 4
 *         capacidadMaxima:
 *           type: integer
 *           example: 15
 *         precioPersona:
 *           type: number
 *           example: 45.00
 *         incluye:
 *           type: string
 *           example: Transporte, guía, entradas
 *         lugarSalida:
 *           type: string
 *           example: Lobby del hotel
 */

/**
 * @swagger
 * /api/experiencias:
 *   get:
 *     summary: Listar experiencias con filtros opcionales
 *     tags: [Experiencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de hotel
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de experiencia
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [ACTIVO, INACTIVO]
 *         description: Filtrar por estado
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre (búsqueda parcial)
 *     responses:
 *       200:
 *         description: Lista de experiencias
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
 *                     $ref: '#/components/schemas/Experiencia'
 *                 count:
 *                   type: integer
 */
router.get('/', verificarToken, experienciaController.listar);

/**
 * @swagger
 * /api/experiencias/verificar-nombre:
 *   get:
 *     summary: Verificar si un nombre está disponible
 *     tags: [Experiencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: experienciaId
 *         schema:
 *           type: integer
 *         description: ID de experiencia a excluir (para actualización)
 *     responses:
 *       200:
 *         description: Disponibilidad del nombre
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
 *                     disponible:
 *                       type: boolean
 *                     mensaje:
 *                       type: string
 */
router.get('/verificar-nombre', verificarToken, experienciaController.verificarNombre);

/**
 * @swagger
 * /api/experiencias/calcular-precio:
 *   get:
 *     summary: Calcular precio total de una experiencia
 *     tags: [Experiencias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: experienciaId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: numeroPersonas
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Precio total calculado
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
 *                     experienciaId:
 *                       type: integer
 *                     numeroPersonas:
 *                       type: integer
 *                     precioTotal:
 *                       type: number
 *       400:
 *         description: Número de personas excede capacidad máxima
 */
router.get('/calcular-precio', verificarToken, experienciaController.calcularPrecio);

/**
 * @swagger
 * /api/experiencias/{id}:
 *   get:
 *     summary: Obtener experiencia por ID
 *     tags: [Experiencias]
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
 *         description: Experiencia encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Experiencia'
 *       404:
 *         description: Experiencia no encontrada
 */
router.get('/:id', verificarToken, experienciaController.obtenerPorId);

/**
 * @swagger
 * /api/experiencias:
 *   post:
 *     summary: Crear una nueva experiencia
 *     tags: [Experiencias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExperienciaInput'
 *           examples:
 *             cityTour:
 *               summary: City Tour
 *               value:
 *                 hotelId: 1
 *                 nombre: City Tour Lima
 *                 descripcion: Recorrido por centro histórico de Lima
 *                 tipo: TOUR
 *                 duracionHoras: 4
 *                 capacidadMaxima: 15
 *                 precioPersona: 45.00
 *                 incluye: Transporte, guía, entradas
 *                 lugarSalida: Lobby del hotel
 *             cooking:
 *               summary: Clase de Cocina
 *               value:
 *                 hotelId: 1
 *                 nombre: Clase de Cocina Peruana
 *                 descripcion: Aprende a preparar ceviche y pisco sour
 *                 tipo: GASTRONOMIA
 *                 duracionHoras: 3
 *                 capacidadMaxima: 10
 *                 precioPersona: 65.00
 *                 incluye: Ingredientes, recetas, degustación
 *                 lugarSalida: Restaurante del hotel
 *             adventure:
 *               summary: Aventura
 *               value:
 *                 hotelId: 1
 *                 nombre: Parapente en la Costa Verde
 *                 descripcion: Vuelo en parapente con instructor
 *                 tipo: AVENTURA
 *                 duracionHoras: 2
 *                 capacidadMaxima: 4
 *                 precioPersona: 120.00
 *                 incluye: Equipo completo, seguro, instructor
 *                 lugarSalida: Playa Miraflores
 *     responses:
 *       201:
 *         description: Experiencia creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Experiencia'
 *       400:
 *         description: Datos inválidos o nombre duplicado
 */
router.post('/', verificarToken, experienciaController.crear);

/**
 * @swagger
 * /api/experiencias/{id}:
 *   put:
 *     summary: Actualizar experiencia
 *     tags: [Experiencias]
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
 *               tipo:
 *                 type: string
 *               duracionHoras:
 *                 type: number
 *               capacidadMaxima:
 *                 type: integer
 *               precioPersona:
 *                 type: number
 *               incluye:
 *                 type: string
 *               lugarSalida:
 *                 type: string
 *     responses:
 *       200:
 *         description: Experiencia actualizada
 *       404:
 *         description: Experiencia no encontrada
 */
router.put('/:id', verificarToken, experienciaController.actualizar);

/**
 * @swagger
 * /api/experiencias/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de la experiencia
 *     tags: [Experiencias]
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
router.patch('/:id/estado', verificarToken, experienciaController.cambiarEstado);

/**
 * @swagger
 * /api/experiencias/{id}/activar:
 *   patch:
 *     summary: Activar experiencia
 *     tags: [Experiencias]
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
 *         description: Experiencia activada exitosamente
 */
router.patch('/:id/activar', verificarToken, experienciaController.activar);

/**
 * @swagger
 * /api/experiencias/{id}/desactivar:
 *   patch:
 *     summary: Desactivar experiencia
 *     tags: [Experiencias]
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
 *         description: Experiencia desactivada exitosamente
 */
router.patch('/:id/desactivar', verificarToken, experienciaController.desactivar);

/**
 * @swagger
 * /api/experiencias/{id}:
 *   delete:
 *     summary: Eliminar experiencia (solo si no tiene reservas)
 *     tags: [Experiencias]
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
 *         description: Experiencia eliminada exitosamente
 *       400:
 *         description: Experiencia tiene reservas asociadas
 *       404:
 *         description: Experiencia no encontrada
 */
router.delete('/:id', verificarToken, experienciaController.eliminar);

module.exports = router;