const express = require('express');
const router = express.Router();
const temporadaController = require('../controllers/temporadaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Temporada:
 *       type: object
 *       properties:
 *         temporada_id: { type: integer, example: 1 }
 *         hotel_id: { type: integer, example: 1 }
 *         nombre_hotel: { type: string, example: "Hotel Plaza Lima" }
 *         nombre: { type: string, example: "Temporada Alta - Verano" }
 *         fecha_inicio: { type: string, format: date, example: "2025-12-15" }
 *         fecha_fin: { type: string, format: date, example: "2026-03-15" }
 *         multiplicador_precio: { type: number, example: 1.5 }
 *         descripcion: { type: string, example: "Temporada de verano con mayor demanda" }
 *         estado_vigencia: { type: string, enum: [VIGENTE, FUTURA, PASADA], example: "VIGENTE" }
 *         fecha_creacion: { type: string, format: date-time }
 *         usuario_creacion: { type: string }
 */

/**
 * @swagger
 * /api/temporadas:
 *   post:
 *     summary: Crear temporada
 *     tags: [Temporadas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hotel_id, nombre, fecha_inicio, fecha_fin]
 *             properties:
 *               hotel_id: { type: integer, example: 1 }
 *               nombre: { type: string, example: "Temporada Alta - Verano" }
 *               fecha_inicio: { type: string, format: date, example: "2025-12-15" }
 *               fecha_fin: { type: string, format: date, example: "2026-03-15" }
 *               multiplicador_precio: { type: number, example: 1.5, description: "Multiplicador de precio (1.0 = sin cambio, 1.5 = +50%, 0.8 = -20%)" }
 *               descripcion: { type: string, example: "Temporada de verano con mayor demanda" }
 *     responses:
 *       201: { description: Temporada creada exitosamente }
 *       400: { description: Datos inválidos }
 *       409: { description: Las fechas se solapan con otra temporada }
 */
router.post('/', temporadaController.crear.bind(temporadaController));

/**
 * @swagger
 * /api/temporadas:
 *   get:
 *     summary: Listar temporadas
 *     tags: [Temporadas]
 *     parameters:
 *       - in: query
 *         name: hotel_id
 *         schema: { type: integer }
 *         description: Filtrar por hotel (opcional)
 *     responses:
 *       200:
 *         description: Lista de temporadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Temporada' }
 */
router.get('/', temporadaController.listar.bind(temporadaController));

/**
 * @swagger
 * /api/temporadas/{id}:
 *   get:
 *     summary: Obtener temporada por ID
 *     tags: [Temporadas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Temporada encontrada }
 *       404: { description: Temporada no encontrada }
 */
router.get('/:id', temporadaController.obtenerPorId.bind(temporadaController));

/**
 * @swagger
 * /api/temporadas/{id}:
 *   put:
 *     summary: Actualizar temporada
 *     tags: [Temporadas]
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
 *             properties:
 *               nombre: { type: string }
 *               fecha_inicio: { type: string, format: date }
 *               fecha_fin: { type: string, format: date }
 *               multiplicador_precio: { type: number }
 *               descripcion: { type: string }
 *     responses:
 *       200: { description: Temporada actualizada }
 *       404: { description: Temporada no encontrada }
 *       409: { description: Las fechas se solapan con otra temporada }
 */
router.put('/:id', temporadaController.actualizar.bind(temporadaController));

/**
 * @swagger
 * /api/temporadas/{id}:
 *   delete:
 *     summary: Eliminar temporada
 *     tags: [Temporadas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204: { description: Temporada eliminada }
 *       404: { description: Temporada no encontrada }
 */
router.delete('/:id', temporadaController.eliminar.bind(temporadaController));

/**
 * @swagger
 * /api/temporadas/vigente:
 *   get:
 *     summary: Obtener temporada vigente para una fecha
 *     tags: [Temporadas]
 *     parameters:
 *       - in: query
 *         name: hotel_id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del hotel
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Fecha a consultar
 *         example: "2025-12-25"
 *     responses:
 *       200:
 *         description: Temporada vigente o null si no hay ninguna
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Temporada' }
 *                 message: { type: string }
 */
router.get('/vigente', temporadaController.obtenerTemporadaVigente.bind(temporadaController));

/**
 * @swagger
 * /api/temporadas/validar-solapamiento:
 *   get:
 *     summary: Validar si hay solapamiento de fechas
 *     tags: [Temporadas]
 *     parameters:
 *       - in: query
 *         name: hotel_id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del hotel
 *       - in: query
 *         name: fecha_inicio
 *         required: true
 *         schema: { type: string, format: date }
 *         example: "2025-12-15"
 *       - in: query
 *         name: fecha_fin
 *         required: true
 *         schema: { type: string, format: date }
 *         example: "2026-03-15"
 *       - in: query
 *         name: temporada_id
 *         schema: { type: integer }
 *         description: ID de temporada (opcional, para actualizaciones)
 *     responses:
 *       200:
 *         description: Resultado de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     hay_solapamiento: { type: boolean }
 *                     mensaje: { type: string }
 */
router.get('/validar-solapamiento', temporadaController.validarSolapamiento.bind(temporadaController));

/**
 * @swagger
 * /api/temporadas/calcular-precio:
 *   get:
 *     summary: Calcular precio con temporada aplicada
 *     tags: [Temporadas]
 *     parameters:
 *       - in: query
 *         name: hotel_id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del hotel
 *       - in: query
 *         name: precio_base
 *         required: true
 *         schema: { type: number }
 *         description: Precio base de la habitación
 *         example: 100.00
 *       - in: query
 *         name: fecha
 *         required: true
 *         schema: { type: string, format: date }
 *         description: Fecha de la reserva
 *         example: "2025-12-25"
 *     responses:
 *       200:
 *         description: Precio calculado con temporada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     hotel_id: { type: integer }
 *                     precio_base: { type: number }
 *                     fecha: { type: string }
 *                     precio_final: { type: number, description: "Precio con multiplicador aplicado" }
 *             example:
 *               success: true
 *               data:
 *                 hotel_id: 1
 *                 precio_base: 100
 *                 fecha: "2025-12-25"
 *                 precio_final: 150
 */
router.get('/calcular-precio', temporadaController.calcularPrecioConTemporada.bind(temporadaController));

/**
 * @swagger
 * /api/temporadas/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de temporadas
 *     tags: [Temporadas]
 *     parameters:
 *       - in: query
 *         name: hotel_id
 *         schema: { type: integer }
 *         description: Filtrar por hotel (opcional)
 *     responses:
 *       200:
 *         description: Estadísticas de temporadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_temporadas: { type: integer, description: "Total de temporadas" }
 *                     vigentes: { type: integer, description: "Temporadas activas hoy" }
 *                     futuras: { type: integer, description: "Temporadas próximas" }
 *                     pasadas: { type: integer, description: "Temporadas finalizadas" }
 *                     multiplicador_promedio: { type: number, description: "Promedio de multiplicadores" }
 *                     multiplicador_maximo: { type: number, description: "Multiplicador más alto" }
 *                     multiplicador_minimo: { type: number, description: "Multiplicador más bajo" }
 *             example:
 *               success: true
 *               data:
 *                 total_temporadas: 12
 *                 vigentes: 2
 *                 futuras: 5
 *                 pasadas: 5
 *                 multiplicador_promedio: 1.25
 *                 multiplicador_maximo: 1.8
 *                 multiplicador_minimo: 0.8
 */
router.get('/estadisticas', temporadaController.obtenerEstadisticas.bind(temporadaController));

module.exports = router;