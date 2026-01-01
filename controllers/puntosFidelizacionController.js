const puntosFidelizacionService = require('../services/puntosFidelizacionService');

class PuntosFidelizacionController {
  
  async obtenerSaldo(req, res) {
    try {
      const { huespedId } = req.params;
      
      if (!huespedId) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El ID del huésped es requerido' }
        });
      }
      
      const resultado = await puntosFidelizacionService.obtenerSaldo(huespedId);
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en obtenerSaldo:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al obtener el saldo' }
      });
    }
  }

  async acumularPuntos(req, res) {
    try {
      const { huespedId, puntos, descripcion, reservaId, habitacionId, tarifaAplicada, numeroNoches } = req.body;
      const usuario = req.usuario?.email || 'SISTEMA';
      
      if (!huespedId || !puntos || !descripcion) {
        return res.status(400).json({
          success: false,
          error: { code: 'CAMPOS_REQUERIDOS', message: 'huespedId, puntos y descripcion son obligatorios' }
        });
      }

      // Validar campos de detalle de reserva si se proporciona reservaId
      if (reservaId && (!habitacionId || tarifaAplicada === undefined || !numeroNoches)) {
        return res.status(400).json({
          success: false,
          error: { code: 'CAMPOS_REQUERIDOS', message: 'reservaId, habitacionId, tarifaAplicada y numeroNoches son obligatorios' }
        });
      }
      
      if (puntos <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'PUNTOS_INVALIDOS', message: 'Los puntos deben ser mayores a cero' }
        });
      }
      
      const resultado = await puntosFidelizacionService.acumularPuntos(
        huespedId, puntos, descripcion, usuario, reservaId || null, habitacionId || null, tarifaAplicada || null, numeroNoches || null
      );
      
      res.status(201).json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en acumularPuntos:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al acumular puntos' }
      });
    }
  }

  async canjearPuntos(req, res) {
    try {
      const { huespedId, puntos, descripcion, reservaId } = req.body;
      const usuario = req.usuario?.email || 'SISTEMA';
      
      if (!huespedId || !puntos || !descripcion) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'huespedId, puntos y descripcion son requeridos' }
        });
      }
      
      if (puntos <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'PUNTOS_INVALIDOS', message: 'Los puntos deben ser mayores a cero' }
        });
      }
      
      const resultado = await puntosFidelizacionService.canjearPuntos(
        huespedId, puntos, descripcion, usuario, reservaId || null
      );
      
      res.status(201).json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en canjearPuntos:', error);
      
      if (error.message && error.message.includes('Puntos insuficientes')) {
        return res.status(400).json({
          success: false,
          error: { code: 'PUNTOS_INSUFICIENTES', message: error.message }
        });
      }
      
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al canjear puntos' }
      });
    }
  }

  async ajustarPuntos(req, res) {
    try {
      const { huespedId, puntos, descripcion } = req.body;
      const usuario = req.usuario?.email || 'SISTEMA';
      
      if (!huespedId || puntos === undefined || !descripcion) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'huespedId, puntos y descripcion son requeridos' }
        });
      }
      
      if (puntos === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'PUNTOS_INVALIDOS', message: 'El ajuste no puede ser cero' }
        });
      }
      
      const resultado = await puntosFidelizacionService.ajustarPuntos(
        huespedId, puntos, descripcion, usuario
      );
      
      res.status(201).json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en ajustarPuntos:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al ajustar puntos' }
      });
    }
  }

  async listarTransacciones(req, res) {
    try {
      const { huespedId } = req.params;
      const { tipo, limite } = req.query;
      
      if (!huespedId) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El ID del huésped es requerido' }
        });
      }
      
      const resultado = await puntosFidelizacionService.listarTransacciones(
        huespedId, tipo || null, limite ? parseInt(limite) : 50
      );
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en listarTransacciones:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al listar transacciones' }
      });
    }
  }

  async obtenerTransaccion(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El ID de la transacción es requerido' }
        });
      }
      
      const resultado = await puntosFidelizacionService.obtenerTransaccion(id);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          error: { code: 'NO_ENCONTRADO', message: 'Transacción no encontrada' }
        });
      }
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en obtenerTransaccion:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al obtener transacción' }
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const { huespedId } = req.params;
      
      if (!huespedId) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El ID del huésped es requerido' }
        });
      }
      
      const resultado = await puntosFidelizacionService.obtenerEstadisticas(huespedId);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          error: { code: 'NO_ENCONTRADO', message: 'Huésped no encontrado' }
        });
      }
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al obtener estadísticas' }
      });
    }
  }

  async obtenerPuntosPorExpirar(req, res) {
    try {
      const { huespedId } = req.params;
      const { dias } = req.query;
      
      if (!huespedId) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El ID del huésped es requerido' }
        });
      }
      
      const resultado = await puntosFidelizacionService.obtenerPuntosPorExpirar(
        huespedId, dias ? parseInt(dias) : 30
      );
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en obtenerPuntosPorExpirar:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al obtener puntos por expirar' }
      });
    }
  }

  async expirarPuntos(req, res) {
    try {
      const { huespedId } = req.body;
      const usuario = req.usuario?.email || 'SISTEMA';
      
      await puntosFidelizacionService.expirarPuntos(usuario, huespedId || null);
      
      res.json({
        success: true,
        data: {
          message: huespedId 
            ? `Puntos expirados para el huésped ${huespedId}` 
            : 'Puntos expirados para todos los huéspedes'
        }
      });
    } catch (error) {
      console.error('Error en expirarPuntos:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al expirar puntos' }
      });
    }
  }

  async verificarPuntosSuficientes(req, res) {
    try {
      const { huespedId } = req.params;
      const { puntos } = req.query;
      
      if (!huespedId || !puntos) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'huespedId y puntos son requeridos' }
        });
      }
      
      const resultado = await puntosFidelizacionService.verificarPuntosSuficientes(
        huespedId, parseInt(puntos)
      );
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en verificarPuntosSuficientes:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al verificar puntos' }
      });
    }
  }

  async eliminarTransaccion(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El ID de la transacción es requerido' }
        });
      }
      
      await puntosFidelizacionService.eliminarTransaccion(id);
      
      res.json({
        success: true,
        data: { message: 'Transacción eliminada correctamente' }
      });
    } catch (error) {
      console.error('Error en eliminarTransaccion:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al eliminar transacción' }
      });
    }
  }

  async calcularPuntosReserva(req, res) {
    try {
      const { huespedId } = req.params;
      const { montoTotal } = req.query;
      
      if (!huespedId || !montoTotal) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'huespedId y montoTotal son requeridos' }
        });
      }
      
      const resultado = await puntosFidelizacionService.calcularPuntosReserva(
        huespedId, parseFloat(montoTotal)
      );
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en calcularPuntosReserva:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al calcular puntos' }
      });
    }
  }
}

module.exports = new PuntosFidelizacionController();