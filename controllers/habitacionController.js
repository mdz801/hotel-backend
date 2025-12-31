// controllers/habitacionController.js
const habitacionService = require('../services/habitacionService');

class HabitacionController {
  
  /**
   * POST /api/habitaciones
   * Crear nueva habitación
   */
  async crear(req, res) {
    try {
      const data = {
        ...req.body,
        usuarioCreacion: req.usuario?.username || req.user?.username || 'SYSTEM'
      };
      
      const habitacion = await habitacionService.crear(data);
      
      res.status(201).json({
        success: true,
        data: habitacion,
        message: 'Habitación creada exitosamente'
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/habitaciones/:id
   * Obtener habitación por ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const habitacion = await habitacionService.obtenerPorId(id);
      
      if (!habitacion) {
        return res.status(404).json({
          success: false,
          message: 'Habitación no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: habitacion
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/habitaciones
   * Listar habitaciones con filtros
   * Query params: hotelId, estado, piso, tipoHabitacionId, numeroHabitacion, capacidadMinima
   */
  async listar(req, res) {
    try {
      const filtros = {
        hotelId: req.query.hotelId,
        tipoHabitacionId: req.query.tipoHabitacionId,
        estado: req.query.estado,
        piso: req.query.piso,
        numeroHabitacion: req.query.numeroHabitacion,
        capacidadMinima: req.query.capacidadMinima
      };
      
      const habitaciones = await habitacionService.listar(filtros);
      
      res.json({
        success: true,
        count: habitaciones.length,
        data: habitaciones
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * PUT /api/habitaciones/:id
   * Actualizar habitación
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const data = {
        ...req.body,
        usuarioModificacion: req.user?.username || 'SYSTEM'
      };
      
      const habitacion = await habitacionService.actualizar(id, data);
      
      res.json({
        success: true,
        data: habitacion,
        message: 'Habitación actualizada exitosamente'
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * PATCH /api/habitaciones/:id/estado
   * Cambiar estado de habitación
   * Body: { estado, observaciones }
   */
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;
      const usuario = req.user?.username || 'SYSTEM';
      
      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'El campo estado es requerido'
        });
      }
      
      const habitacion = await habitacionService.cambiarEstado(
        id,
        estado,
        observaciones,
        usuario
      );
      
      res.json({
        success: true,
        data: habitacion,
        message: 'Estado actualizado exitosamente'
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * DELETE /api/habitaciones/:id
   * Eliminar (bloquear) habitación
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'SYSTEM';
      
      const result = await habitacionService.eliminar(id, usuario);
      
      res.json({
        success: true,
        message: result.message
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/habitaciones/:id/ocupada
   * Verificar si habitación está ocupada
   * Query params: fechaInicio, fechaFin (opcional, default hoy)
   */
  async verificarOcupacion(req, res) {
    try {
      const { id } = req.params;
      const { fechaInicio, fechaFin } = req.query;
      
      const ocupada = await habitacionService.estaOcupada(
        id,
        fechaInicio,
        fechaFin
      );
      
      res.json({
        success: true,
        data: {
          habitacionId: id,
          ocupada,
          estado: ocupada ? 'OCUPADA' : 'DISPONIBLE'
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/habitaciones/hotel/:hotelId/disponibles
   * Obtener habitaciones disponibles para fechas
   * Query params: fechaCheckin, fechaCheckout, capacidadAdultos
   */
  async obtenerDisponibles(req, res) {
    try {
      const { hotelId } = req.params;
      const { fechaCheckin, fechaCheckout, capacidadAdultos = 1 } = req.query;
      
      if (!fechaCheckin || !fechaCheckout) {
        return res.status(400).json({
          success: false,
          message: 'fechaCheckin y fechaCheckout son requeridos'
        });
      }
      
      const habitaciones = await habitacionService.obtenerDisponibles(
        hotelId,
        fechaCheckin,
        fechaCheckout,
        Number(capacidadAdultos)
      );
      
      res.json({
        success: true,
        count: habitaciones.length,
        data: habitaciones
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * POST /api/habitaciones/:id/mantenimiento/iniciar
   * Iniciar mantenimiento
   * Body: { observaciones }
   */
  async iniciarMantenimiento(req, res) {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;
      const usuario = req.user?.username || 'SYSTEM';
      
      if (!observaciones) {
        return res.status(400).json({
          success: false,
          message: 'Las observaciones son requeridas'
        });
      }
      
      const habitacion = await habitacionService.iniciarMantenimiento(
        id,
        observaciones,
        usuario
      );
      
      res.json({
        success: true,
        data: habitacion,
        message: 'Mantenimiento iniciado exitosamente'
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * POST /api/habitaciones/:id/mantenimiento/finalizar
   * Finalizar mantenimiento
   */
  async finalizarMantenimiento(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'SYSTEM';
      
      const habitacion = await habitacionService.finalizarMantenimiento(
        id,
        usuario
      );
      
      res.json({
        success: true,
        data: habitacion,
        message: 'Mantenimiento finalizado exitosamente'
      });
      
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/habitaciones/hotel/:hotelId/estadisticas
   * Obtener estadísticas de habitaciones
   */
  async obtenerEstadisticas(req, res) {
    try {
      const { hotelId } = req.params;
      
      const estadisticas = await habitacionService.obtenerEstadisticas(hotelId);
      
      res.json({
        success: true,
        data: estadisticas
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new HabitacionController();