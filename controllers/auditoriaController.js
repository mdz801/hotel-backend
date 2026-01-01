const auditoriaService = require('../services/auditoriaService');

class AuditoriaController {
  
  async listarCambios(req, res) {
    try {
      const { pagina = 1, limite = 50 } = req.query;
      
      const resultado = await auditoriaService.listarCambios(
        parseInt(pagina),
        parseInt(limite)
      );
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en listarCambios:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al listar cambios' }
      });
    }
  }

  async obtenerCambio(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El ID del cambio es requerido' }
        });
      }
      
      const resultado = await auditoriaService.obtenerCambio(id);
      
      if (!resultado) {
        return res.status(404).json({
          success: false,
          error: { code: 'NO_ENCONTRADO', message: 'Cambio no encontrado' }
        });
      }
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en obtenerCambio:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al obtener cambio' }
      });
    }
  }

  async cambiosPorTabla(req, res) {
    try {
      const { tabla } = req.params;
      const { pagina = 1, limite = 50 } = req.query;
      
      if (!tabla) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El nombre de la tabla es requerido' }
        });
      }
      
      const resultado = await auditoriaService.cambiosPorTabla(
        tabla.toUpperCase(),
        parseInt(pagina),
        parseInt(limite)
      );
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en cambiosPorTabla:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al obtener cambios por tabla' }
      });
    }
  }

  async cambiosPorUsuario(req, res) {
    try {
      const { usuarioId } = req.params;
      const { pagina = 1, limite = 50 } = req.query;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          error: { code: 'DATOS_INVALIDOS', message: 'El ID del usuario es requerido' }
        });
      }
      
      const resultado = await auditoriaService.cambiosPorUsuario(
        usuarioId,
        parseInt(pagina),
        parseInt(limite)
      );
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en cambiosPorUsuario:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al obtener cambios por usuario' }
      });
    }
  }

  async reporteConsolidado(req, res) {
    try {
      const { dias = 7 } = req.query;
      
      const resultado = await auditoriaService.reporteConsolidado(parseInt(dias));
      
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en reporteConsolidado:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ERROR_SERVIDOR', message: error.message || 'Error al generar reporte' }
      });
    }
  }

}

module.exports = new AuditoriaController();
