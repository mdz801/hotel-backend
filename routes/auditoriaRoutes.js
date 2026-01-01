const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoriaController');

/**
 * @swagger
 * tags:
 *   name: Auditoria
 *   description: Consulta del historial de cambios en el sistema
 */

/**
 * @swagger
 * /api/auditoria:
 *   get:
 *     summary: Listar todos los cambios (paginado)
 *     tags: [Auditoria]
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Listado de cambios
 */
router.get('/', auditoriaController.listarCambios);

/**
 * @swagger
 * /api/auditoria/{id}:
 *   get:
 *     summary: Obtener un cambio específico
 *     tags: [Auditoria]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cambio obtenido
 */
router.get('/:id', auditoriaController.obtenerCambio);

/**
 * @swagger
 * /api/auditoria/tabla/{tabla}:
 *   get:
 *     summary: Cambios de una tabla específica
 *     tags: [Auditoria]
 *     parameters:
 *       - in: path
 *         name: tabla
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Cambios de la tabla
 */
router.get('/tabla/:tabla', auditoriaController.cambiosPorTabla);

/**
 * @swagger
 * /api/auditoria/usuario/{usuarioId}:
 *   get:
 *     summary: Cambios realizados por un usuario
 *     tags: [Auditoria]
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cambios del usuario
 */
router.get('/usuario/:usuarioId', auditoriaController.cambiosPorUsuario);

/**
 * @swagger
 * /api/auditoria/reporte:
 *   get:
 *     summary: Reporte consolidado de cambios
 *     tags: [Auditoria]
 *     parameters:
 *       - in: query
 *         name: dias
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Reporte de cambios
 */
router.get('/reporte/consolidado', auditoriaController.reporteConsolidado);

module.exports = router;
