// controllers/detalleReservaController.js
const detalleReservaService = require('../services/detalleReservaService');

class DetalleReservaController {
  
  // Agregar habitación a reserva
  async agregar(req, res) {
    try {
      const { reservaId, habitacionId, tarifaAplicada, numeroNoches } = req.body;

      // Validaciones
      if (!reservaId || !habitacionId || !tarifaAplicada || !numeroNoches) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CAMPOS_REQUERIDOS',
            message: 'reservaId, habitacionId, tarifaAplicada y numeroNoches son obligatorios'
          }
        });
      }

      if (tarifaAplicada <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TARIFA_INVALIDA',
            message: 'La tarifa debe ser mayor a cero'
          }
        });
      }

      if (numeroNoches <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOCHES_INVALIDAS',
            message: 'El número de noches debe ser mayor a cero'
          }
        });
      }

      const data = {
        reservaId,
        habitacionId,
        tarifaAplicada,
        numeroNoches,
        usuario: req.usuario?.email || 'SYSTEM'
      };

      const detalle = await detalleReservaService.agregar(data);

      res.status(201).json({
        success: true,
        data: detalle
      });

    } catch (error) {
      console.error('Error al agregar habitación:', error);
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('no está disponible')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'HABITACION_NO_DISPONIBLE',
            message: errorMessage
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_AGREGAR_HABITACION',
          message: errorMessage
        }
      });
    }
  }

  // Obtener detalle por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const detalle = await detalleReservaService.obtenerPorId(parseInt(id));

      if (!detalle) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DETALLE_NO_ENCONTRADO',
            message: 'El detalle de reserva no existe'
          }
        });
      }

      res.json({
        success: true,
        data: detalle
      });

    } catch (error) {
      console.error('Error al obtener detalle:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_OBTENER_DETALLE',
          message: errorMessage
        }
      });
    }
  }

  // Listar detalles con filtros
  async listar(req, res) {
    try {
      const { reservaId } = req.query;

      let detalles;

      if (reservaId) {
        detalles = await detalleReservaService.listarPorReserva(parseInt(reservaId));
      } else {
        detalles = await detalleReservaService.listar();
      }

      res.json({
        success: true,
        data: detalles,
        count: detalles.length
      });

    } catch (error) {
      console.error('Error al listar detalles:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_LISTAR_DETALLES',
          message: errorMessage
        }
      });
    }
  }

  // Actualizar detalle
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { tarifaAplicada, numeroNoches } = req.body;

      // Validar tarifa si se proporciona
      if (tarifaAplicada && tarifaAplicada <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'TARIFA_INVALIDA',
            message: 'La tarifa debe ser mayor a cero'
          }
        });
      }

      // Validar noches si se proporciona
      if (numeroNoches && numeroNoches <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOCHES_INVALIDAS',
            message: 'El número de noches debe ser mayor a cero'
          }
        });
      }

      const data = {
        tarifaAplicada,
        numeroNoches,
        usuario: req.usuario?.email || 'SYSTEM'
      };

      const detalle = await detalleReservaService.actualizar(parseInt(id), data);

      res.json({
        success: true,
        data: detalle
      });

    } catch (error) {
      console.error('Error al actualizar detalle:', error);
      const errorMessage = error.message || error.toString();

      if (errorMessage.includes('no existe')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DETALLE_NO_ENCONTRADO',
            message: errorMessage
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ACTUALIZAR_DETALLE',
          message: errorMessage
        }
      });
    }
  }

  // Eliminar detalle
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      await detalleReservaService.eliminar(parseInt(id));

      res.status(204).send();

    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      const errorMessage = error.message || error.toString();

      if (errorMessage.includes('no existe')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'DETALLE_NO_ENCONTRADO',
            message: errorMessage
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ELIMINAR_DETALLE',
          message: errorMessage
        }
      });
    }
  }

  // Calcular subtotal de un detalle
  async calcularSubtotal(req, res) {
    try {
      const { id } = req.params;

      const subtotal = await detalleReservaService.calcularSubtotalDetalle(parseInt(id));

      res.json({
        success: true,
        data: {
          detalleId: parseInt(id),
          subtotal
        }
      });

    } catch (error) {
      console.error('Error al calcular subtotal:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_CALCULAR_SUBTOTAL',
          message: errorMessage
        }
      });
    }
  }

  // Calcular total de una reserva
  async calcularTotalReserva(req, res) {
    try {
      const { reservaId } = req.params;

      const [total, detalles] = await Promise.all([
        detalleReservaService.calcularTotalReserva(parseInt(reservaId)),
        detalleReservaService.listarPorReserva(parseInt(reservaId))
      ]);

      res.json({
        success: true,
        data: {
          reservaId: parseInt(reservaId),
          totalHabitaciones: total,
          cantidadHabitaciones: detalles.length,
          detalles
        }
      });

    } catch (error) {
      console.error('Error al calcular total:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_CALCULAR_TOTAL',
          message: errorMessage
        }
      });
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(req, res) {
    try {
      const { reservaId } = req.query;

      const estadisticas = await detalleReservaService.obtenerEstadisticas(
        reservaId ? parseInt(reservaId) : null
      );

      res.json({
        success: true,
        data: estadisticas
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ESTADISTICAS',
          message: errorMessage
        }
      });
    }
  }
}

module.exports = new DetalleReservaController();