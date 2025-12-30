// routes/huespedRoutes.js
const express = require('express');
const router = express.Router();
const huespedController = require('../controllers/huespedController');
const verificarToken = require('../middleware/verificarToken');
const { soloAdmin, soloRecepcionista, recepcionistaOAdmin } = require('../middleware/verificarRol');

/**
 * @swagger
 * tags:
 *   name: Huéspedes
 *   description: Gestión de huéspedes del hotel
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Huesped:
 *       type: object
 *       required:
 *         - tipo_documento
 *         - numero_documento
 *         - nombres
 *         - apellidos
 *         - email
 *       properties:
 *         tipo_documento:
 *           type: string
 *           enum: [DNI, PASAPORTE, CARNET_EXTRANJERIA, RUC]
 *           description: Tipo de documento
 *         numero_documento:
 *           type: string
 *           description: Número de documento
 *         nombres:
 *           type: string
 *           description: Nombres del huésped
 *         apellidos:
 *           type: string
 *           description: Apellidos del huésped
 *         fecha_nacimiento:
 *           type: string
 *           format: date
 *           description: Fecha de nacimiento (YYYY-MM-DD)
 *         genero:
 *           type: string
 *           enum: [M, F, O]
 *           description: Género (M=Masculino, F=Femenino, O=Otro)
 *         email:
 *           type: string
 *           format: email
 *           description: Email del huésped
 *         telefono:
 *           type: string
 *           description: Teléfono
 *         direccion:
 *           type: string
 *           description: Dirección
 *         ciudad:
 *           type: string
 *           description: Ciudad
 *         pais:
 *           type: string
 *           description: País
 *         membresia_id:
 *           type: integer
 *           description: ID de la membresía
 *         preferencias:
 *           type: string
 *           description: Preferencias del huésped (JSON)
 *       example:
 *         tipo_documento: "DNI"
 *         numero_documento: "12345678"
 *         nombres: "Juan Carlos"
 *         apellidos: "Pérez García"
 *         fecha_nacimiento: "1990-05-15"
 *         genero: "M"
 *         email: "juan.perez@email.com"
 *         telefono: "+51987654321"
 *         direccion: "Av. Principal 123"
 *         ciudad: "Lima"
 *         pais: "Perú"
 *         membresia_id: 1
 *         preferencias: '{"habitacion_piso":"alto","tipo_cama":"king"}'
 */

// TODAS las rutas requieren autenticación
router.use(verificarToken);

/**
 * @swagger
 * /api/huespedes:
 *   get:
 *     tags: [Huéspedes]
 *     summary: Listar todos los huéspedes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: pais
 *         schema:
 *           type: string
 *         description: Filtrar por país
 *       - in: query
 *         name: membresia_id
 *         schema:
 *           type: integer
 *         description: Filtrar por membresía
 *     responses:
 *       200:
 *         description: Lista de huéspedes
 */
router.get('/', recepcionistaOAdmin, huespedController.listarHuespedes);

/**
 * @swagger
 * /api/huespedes:
 *   post:
 *     tags: [Huéspedes]
 *     summary: Crear nuevo huésped
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Huesped'
 *     responses:
 *       201:
 *         description: Huésped creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El documento o email ya existe
 */
router.post('/', recepcionistaOAdmin, huespedController.crearHuesped);

// ========== RUTAS ESPECÍFICAS (ANTES DE :id) ==========

/**
 * @swagger
 * /api/huespedes/documento/{tipo}/{numero}:
 *   get:
 *     tags: [Huéspedes]
 *     summary: Buscar huésped por documento
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [DNI, PASAPORTE, CARNET_EXTRANJERIA, RUC]
 *         description: Tipo de documento
 *       - in: path
 *         name: numero
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de documento
 *     responses:
 *       200:
 *         description: Huésped encontrado
 *       404:
 *         description: Huésped no encontrado
 */
router.get('/documento/:tipo/:numero', recepcionistaOAdmin, huespedController.buscarPorDocumento);

// ========== RUTAS CON :id ==========

/**
 * @swagger
 * /api/huespedes/{id}:
 *   get:
 *     tags: [Huéspedes]
 *     summary: Obtener huésped por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del huésped
 *     responses:
 *       200:
 *         description: Huésped encontrado
 *       404:
 *         description: Huésped no encontrado
 */
router.get('/:id', recepcionistaOAdmin, huespedController.obtenerHuesped);

/**
 * @swagger
 * /api/huespedes/{id}:
 *   put:
 *     tags: [Huéspedes]
 *     summary: Actualizar huésped
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del huésped
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               pais:
 *                 type: string
 *               membresia_id:
 *                 type: integer
 *               preferencias:
 *                 type: string
 *     responses:
 *       200:
 *         description: Huésped actualizado exitosamente
 *       404:
 *         description: Huésped no encontrado
 *       409:
 *         description: Email ya registrado
 */
router.put('/:id', recepcionistaOAdmin, huespedController.actualizarHuesped);

/**
 * @swagger
 * /api/huespedes/{id}:
 *   delete:
 *     tags: [Huéspedes]
 *     summary: Eliminar huésped (solo ADMIN)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del huésped
 *     responses:
 *       200:
 *         description: Huésped eliminado exitosamente
 *       400:
 *         description: No se puede eliminar (tiene reservas activas)
 *       404:
 *         description: Huésped no encontrado
 */
router.delete('/:id', soloAdmin, huespedController.eliminarHuesped);

/**
 * @swagger
 * /api/huespedes/{id}/puntos:
 *   get:
 *     tags: [Huéspedes]
 *     summary: Consultar puntos acumulados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del huésped
 *     responses:
 *       200:
 *         description: Puntos del huésped
 */
router.get('/:id/puntos', recepcionistaOAdmin, huespedController.consultarPuntos);

/**
 * @swagger
 * /api/huespedes/{id}/puntos/historial:
 *   get:
 *     tags: [Huéspedes]
 *     summary: Historial de movimientos de puntos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del huésped
 *     responses:
 *       200:
 *         description: Historial de puntos
 */
router.get('/:id/puntos/historial', recepcionistaOAdmin, huespedController.historialPuntos);

module.exports = router;