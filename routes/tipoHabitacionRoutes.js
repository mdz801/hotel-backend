const express = require('express');
const router = express.Router();
const tipoHabitacionController = require('../controllers/TipoHabitacionController');

/**
 * @swagger
 * components:
 *   schemas:
 *     TipoHabitacion:
 *       type: object
 *       properties:
 *         tipo_habitacion_id: { type: integer, example: 1 }
 *         nombre: { type: string, example: "Suite Ejecutiva" }
 *         descripcion: { type: string }
 *         capacidad:
 *           type: object
 *           properties:
 *             adultos: { type: integer }
 *             ninos: { type: integer }
 *             total: { type: integer }
 *         metros_cuadrados: { type: number }
 *         tipo_cama: { type: string }
 *         amenidades: { type: array, items: { type: string } }
 */

/**
 * @swagger
 * /api/tipos-habitacion:
 *   post:
 *     summary: Crear tipo de habitación
 *     tags: [Tipos de Habitación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, capacidad_adultos]
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *               capacidad_adultos: { type: integer }
 *               capacidad_ninos: { type: integer }
 *               metros_cuadrados: { type: number }
 *               tipo_cama: { type: string }
 *               amenidades: { type: string }
 *     responses:
 *       201: { description: Tipo creado }
 */
router.post('/', tipoHabitacionController.crearTipoHabitacion.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion:
 *   get:
 *     summary: Listar todos los tipos
 *     tags: [Tipos de Habitación]
 *     responses:
 *       200: { description: Lista de tipos }
 */
router.get('/', tipoHabitacionController.listarTipos.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion/activos:
 *   get:
 *     summary: Listar tipos activos
 *     tags: [Tipos de Habitación]
 *     responses:
 *       200: { description: Tipos con habitaciones }
 */
router.get('/activos', tipoHabitacionController.listarTiposActivos.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion/buscar:
 *   get:
 *     summary: Buscar por nombre
 *     tags: [Tipos de Habitación]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Resultados }
 */
router.get('/buscar', tipoHabitacionController.buscarPorNombre.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion/capacidad:
 *   get:
 *     summary: Filtrar por capacidad mínima
 *     tags: [Tipos de Habitación]
 *     parameters:
 *       - in: query
 *         name: capacidad
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Tipos filtrados }
 */
router.get('/capacidad', tipoHabitacionController.obtenerPorCapacidad.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion/verificar-nombre:
 *   get:
 *     summary: Verificar disponibilidad de nombre
 *     tags: [Tipos de Habitación]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: tipo_habitacion_id
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Disponibilidad }
 */
router.get('/verificar-nombre', tipoHabitacionController.verificarNombreDisponible.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion/estadisticas:
 *   get:
 *     summary: Obtener estadísticas
 *     tags: [Tipos de Habitación]
 *     responses:
 *       200: { description: Estadísticas por tipo }
 */
router.get('/estadisticas', tipoHabitacionController.obtenerEstadisticas.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion/{id}:
 *   get:
 *     summary: Obtener tipo por ID
 *     tags: [Tipos de Habitación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Tipo encontrado }
 */
router.get('/:id', tipoHabitacionController.obtenerTipoPorId.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion/{id}:
 *   put:
 *     summary: Actualizar tipo
 *     tags: [Tipos de Habitación]
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
 *     responses:
 *       200: { description: Tipo actualizado }
 */
router.put('/:id', tipoHabitacionController.actualizarTipoHabitacion.bind(tipoHabitacionController));

/**
 * @swagger
 * /api/tipos-habitacion/{id}:
 *   delete:
 *     summary: Eliminar tipo
 *     tags: [Tipos de Habitación]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Tipo eliminado }
 */
router.delete('/:id', tipoHabitacionController.eliminarTipoHabitacion.bind(tipoHabitacionController));

module.exports = router;