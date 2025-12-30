const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
/**
 * @swagger
 * tags:
 *   name: HOTELES
 *   description: Gestión de hoteles del sistema
 */





/**
 * @swagger
 * /api/hoteles:
 *   get:
 *     summary: Listar hoteles
 *     description: Obtiene la lista de hoteles activos
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
 *     responses:
 *       200:
 *         description: Lista de hoteles
 *       500:
 *         description: Error del servidor
 */
router.get('/', hotelController.listarHoteles);

/**
 * @swagger
 * /api/hoteles/{id}:
 *   get:
 *     summary: Obtener hotel por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *     responses:
 *       200:
 *         description: Hotel encontrado
 *       404:
 *         description: Hotel no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', hotelController.obtenerHotel);

/**
 * @swagger
 * /api/hoteles:
 *   post:
 *     summary: Crear hotel
 *     description: Crea un nuevo hotel en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *               - ciudad
 *               - pais
 *               - codigo_postal
 *               - telefono
 *               - email
 *               - estrellas
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Hotel Sol Andino"
 *               direccion:
 *                 type: string
 *                 example: "Av. El Sol 123"
 *               ciudad:
 *                 type: string
 *                 example: "Cusco"
 *               pais:
 *                 type: string
 *                 example: "Perú"
 *               codigo_postal:
 *                 type: string
 *                 example: "08001"
 *               telefono:
 *                 type: string
 *                 example: "+51 984 123 456"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "info@hotelsolandino.com"
 *               estrellas:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               descripcion:
 *                 type: string
 *                 example: "Hotel ubicado en el centro histórico de Cusco"
 *     responses:
 *       201:
 *         description: Hotel creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', hotelController.crearHotel);

/**
 * @swagger
 * /api/hoteles/{id}:
 *   put:
 *     summary: Actualizar hotel (usuario normal)
 *     description: Actualización limitada del hotel (dirección, teléfono, email, estado)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Hotel actualizado
 *       404:
 *         description: Hotel no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', hotelController.actualizarHotel);

/**
 * @swagger
 * /api/hoteles/{id}/admin:
 *   put:
 *     summary: Actualizar hotel (ADMIN)
 *     description: Actualización completa del hotel (solo rol administrador)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *               - ciudad
 *               - pais
 *               - codigo_postal
 *               - telefono
 *               - email
 *               - estrellas
 *               - estado
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Hotel Sol Andino Renovado"
 *               direccion:
 *                 type: string
 *                 example: "Av. El Sol 999"
 *               ciudad:
 *                 type: string
 *                 example: "Cusco"
 *               pais:
 *                 type: string
 *                 example: "Perú"
 *               codigo_postal:
 *                 type: string
 *                 example: "08002"
 *               telefono:
 *                 type: string
 *                 example: "+51 999 888 777"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@hotelsolandino.com"
 *               estrellas:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               descripcion:
 *                 type: string
 *                 example: "Hotel remodelado completamente en 2025"
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO, MANTENIMIENTO]
 *                 example: "ACTIVO"
 *     responses:
 *       200:
 *         description: Hotel actualizado correctamente (admin)
 *       404:
 *         description: Hotel no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/admin', hotelController.actualizarHotelAdmin);

/**
 * @swagger
 * /api/hoteles/{id}:
 *   delete:
 *     summary: Eliminar hotel (borrado lógico)
 *     description: Cambia el estado del hotel a INACTIVO
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *     responses:
 *       200:
 *         description: Hotel eliminado (estado INACTIVO)
 *       404:
 *         description: Hotel no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', hotelController.eliminarHotel);

module.exports = router;