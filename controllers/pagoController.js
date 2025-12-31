// controllers/pagoController.js
const pagoService = require('../services/pagoService');

class PagoController {
  
  // Crear pago
  async crear(req, res) {
    try {
      const { reservaId, monto, moneda, metodoPago, referenciaExterna, descripcion } = req.body;

      // Validaciones
      if (!reservaId || !monto || !metodoPago) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CAMPOS_REQUERIDOS',
            message: 'reservaId, monto y metodoPago son obligatorios'
          }
        });
      }

      if (monto <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MONTO_INVALIDO',
            message: 'El monto debe ser mayor a cero'
          }
        });
      }

      const data = {
        reservaId,
        monto,
        moneda: moneda || 'USD',
        metodoPago,
        referenciaExterna,
        descripcion,
        usuario: req.usuario?.email || 'SYSTEM'
      };

      const pago = await pagoService.crear(data);

      res.status(201).json({
        success: true,
        data: pago
      });

    } catch (error) {
      console.error('Error al crear pago:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_CREAR_PAGO',
          message: error.message
        }
      });
    }
  }

  // Obtener pago por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const pago = await pagoService.obtenerPorId(parseInt(id));

      if (!pago) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PAGO_NO_ENCONTRADO',
            message: 'El pago no existe'
          }
        });
      }

      res.json({
        success: true,
        data: pago
      });

    } catch (error) {
      console.error('Error al obtener pago:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_OBTENER_PAGO',
          message: error.message
        }
      });
    }
  }

  // Listar pagos con filtros
  async listar(req, res) {
    try {
      const { reservaId, estado, metodoPago } = req.query;

      let pagos;

      if (reservaId) {
        pagos = await pagoService.listarPorReserva(parseInt(reservaId));
      } else if (estado) {
        pagos = await pagoService.listarPorEstado(estado.toUpperCase());
      } else if (metodoPago) {
        pagos = await pagoService.listarPorMetodo(metodoPago);
      } else {
        pagos = await pagoService.listar();
      }

      res.json({
        success: true,
        data: pagos,
        count: pagos.length
      });

    } catch (error) {
      console.error('Error al listar pagos:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_LISTAR_PAGOS',
          message: error.message
        }
      });
    }
  }

  // Actualizar pago
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { monto, metodoPago, referenciaExterna, descripcion } = req.body;

      if (monto && monto <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MONTO_INVALIDO',
            message: 'El monto debe ser mayor a cero'
          }
        });
      }

      const data = {
        monto,
        metodoPago,
        referenciaExterna,
        descripcion,
        usuario: req.usuario?.email || 'SYSTEM'
      };

      const pago = await pagoService.actualizar(parseInt(id), data);

      res.json({
        success: true,
        data: pago
      });

    } catch (error) {
      console.error('Error al actualizar pago:', error);
      
      if (error.message.includes('PENDIENTE')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ESTADO_INVALIDO',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ACTUALIZAR_PAGO',
          message: error.message
        }
      });
    }
  }

  // Aprobar pago
  async aprobar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.email || 'SYSTEM';

      const pago = await pagoService.aprobar(parseInt(id), usuario);

      res.json({
        success: true,
        data: pago,
        message: 'Pago aprobado exitosamente'
      });

    } catch (error) {
      console.error('Error al aprobar pago:', error);

      if (error.message.includes('PENDIENTES')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ESTADO_INVALIDO',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_APROBAR_PAGO',
          message: error.message
        }
      });
    }
  }

  // Rechazar pago
  async rechazar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.email || 'SYSTEM';

      const pago = await pagoService.rechazar(parseInt(id), usuario);

      res.json({
        success: true,
        data: pago,
        message: 'Pago rechazado exitosamente'
      });

    } catch (error) {
      console.error('Error al rechazar pago:', error);

      if (error.message.includes('PENDIENTES')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ESTADO_INVALIDO',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_RECHAZAR_PAGO',
          message: error.message
        }
      });
    }
  }

  // Reembolsar pago
  async reembolsar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.email || 'SYSTEM';

      const pago = await pagoService.reembolsar(parseInt(id), usuario);

      res.json({
        success: true,
        data: pago,
        message: 'Pago reembolsado exitosamente'
      });

    } catch (error) {
      console.error('Error al reembolsar pago:', error);

      if (error.message.includes('APROBADOS')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ESTADO_INVALIDO',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_REEMBOLSAR_PAGO',
          message: error.message
        }
      });
    }
  }

  // Eliminar pago (solo PENDIENTE)
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      await pagoService.eliminar(parseInt(id));

      res.status(204).send();

    } catch (error) {
      console.error('Error al eliminar pago:', error);

      if (error.message.includes('PENDIENTES')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ESTADO_INVALIDO',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ELIMINAR_PAGO',
          message: error.message
        }
      });
    }
  }

  // Obtener resumen de pagos de reserva
  async obtenerResumenReserva(req, res) {
    try {
      const { reservaId } = req.params;

      const [totalPagado, saldoPendiente, pagos] = await Promise.all([
        pagoService.obtenerTotalPagadoReserva(parseInt(reservaId)),
        pagoService.obtenerSaldoPendienteReserva(parseInt(reservaId)),
        pagoService.listarPorReserva(parseInt(reservaId))
      ]);

      res.json({
        success: true,
        data: {
          reservaId: parseInt(reservaId),
          totalPagado,
          saldoPendiente,
          pagos,
          cantidadPagos: pagos.length
        }
      });

    } catch (error) {
      console.error('Error al obtener resumen de pagos:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_RESUMEN_PAGOS',
          message: error.message
        }
      });
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : null;
      const fechaFinDate = fechaFin ? new Date(fechaFin) : null;

      const estadisticas = await pagoService.obtenerEstadisticas(
        fechaInicioDate,
        fechaFinDate
      );

      res.json({
        success: true,
        data: estadisticas
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ESTADISTICAS',
          message: error.message
        }
      });
    }
  }
}

module.exports = new PagoController();