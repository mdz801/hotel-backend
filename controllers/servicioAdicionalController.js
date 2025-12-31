// controllers/servicioAdicionalController.js
const servicioAdicionalService = require('../services/servicioAdicionalService');

class ServicioAdicionalController {
  
  // Crear servicio
  async crear(req, res) {
    try {
      const { hotelId, nombre, descripcion, categoria, precio, moneda, unidad } = req.body;

      // Validaciones
      if (!hotelId || !nombre || !precio) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CAMPOS_REQUERIDOS',
            message: 'hotelId, nombre y precio son obligatorios'
          }
        });
      }

      if (precio <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PRECIO_INVALIDO',
            message: 'El precio debe ser mayor a cero'
          }
        });
      }

      const data = {
        hotelId,
        nombre,
        descripcion,
        categoria,
        precio,
        moneda: moneda || 'USD',
        unidad: unidad || 'SERVICIO',
        usuario: req.usuario?.email || 'SYSTEM'
      };

      const servicio = await servicioAdicionalService.crear(data);

      res.status(201).json({
        success: true,
        data: servicio
      });

    } catch (error) {
      console.error('Error al crear servicio:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_CREAR_SERVICIO',
          message: error.message
        }
      });
    }
  }

  // Obtener servicio por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const servicio = await servicioAdicionalService.obtenerPorId(parseInt(id));

      if (!servicio) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERVICIO_NO_ENCONTRADO',
            message: 'El servicio no existe'
          }
        });
      }

      res.json({
        success: true,
        data: servicio
      });

    } catch (error) {
      console.error('Error al obtener servicio:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_OBTENER_SERVICIO',
          message: error.message
        }
      });
    }
  }

  // Listar servicios con filtros
  async listar(req, res) {
    try {
      const { hotelId, categoria, nombre, soloActivos } = req.query;

      let servicios;

      if (nombre) {
        servicios = await servicioAdicionalService.buscarPorNombre(
          nombre,
          hotelId ? parseInt(hotelId) : null
        );
      } else if (categoria) {
        servicios = await servicioAdicionalService.listarPorCategoria(
          categoria,
          hotelId ? parseInt(hotelId) : null
        );
      } else if (soloActivos === 'true') {
        servicios = await servicioAdicionalService.listarActivos(
          hotelId ? parseInt(hotelId) : null
        );
      } else if (hotelId) {
        servicios = await servicioAdicionalService.listarPorHotel(parseInt(hotelId));
      } else {
        servicios = await servicioAdicionalService.listar();
      }

      res.json({
        success: true,
        data: servicios,
        count: servicios.length
      });

    } catch (error) {
      console.error('Error al listar servicios:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_LISTAR_SERVICIOS',
          message: error.message
        }
      });
    }
  }

  // Actualizar servicio
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, categoria, precio, moneda, unidad } = req.body;

      if (precio && precio <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PRECIO_INVALIDO',
            message: 'El precio debe ser mayor a cero'
          }
        });
      }

      const data = {
        nombre,
        descripcion,
        categoria,
        precio,
        moneda,
        unidad,
        usuario: req.usuario?.email || 'SYSTEM'
      };

      const servicio = await servicioAdicionalService.actualizar(parseInt(id), data);

      res.json({
        success: true,
        data: servicio
      });

    } catch (error) {
      console.error('Error al actualizar servicio:', error);

      if (error.message.includes('no existe')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERVICIO_NO_ENCONTRADO',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ACTUALIZAR_SERVICIO',
          message: error.message
        }
      });
    }
  }

  // Cambiar estado
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado || !['ACTIVO', 'INACTIVO'].includes(estado.toUpperCase())) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ESTADO_INVALIDO',
            message: 'Estado debe ser ACTIVO o INACTIVO'
          }
        });
      }

      const usuario = req.usuario?.email || 'SYSTEM';
      const servicio = await servicioAdicionalService.cambiarEstado(
        parseInt(id),
        estado.toUpperCase(),
        usuario
      );

      res.json({
        success: true,
        data: servicio,
        message: `Servicio ${estado.toLowerCase()} exitosamente`
      });

    } catch (error) {
      console.error('Error al cambiar estado:', error);

      if (error.message.includes('no existe')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERVICIO_NO_ENCONTRADO',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_CAMBIAR_ESTADO',
          message: error.message
        }
      });
    }
  }

  // Activar servicio
  async activar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.email || 'SYSTEM';

      const servicio = await servicioAdicionalService.cambiarEstado(
        parseInt(id),
        'ACTIVO',
        usuario
      );

      res.json({
        success: true,
        data: servicio,
        message: 'Servicio activado exitosamente'
      });

    } catch (error) {
      console.error('Error al activar servicio:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ACTIVAR_SERVICIO',
          message: error.message
        }
      });
    }
  }

  // Desactivar servicio
  async desactivar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.email || 'SYSTEM';

      const servicio = await servicioAdicionalService.cambiarEstado(
        parseInt(id),
        'INACTIVO',
        usuario
      );

      res.json({
        success: true,
        data: servicio,
        message: 'Servicio desactivado exitosamente'
      });

    } catch (error) {
      console.error('Error al desactivar servicio:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_DESACTIVAR_SERVICIO',
          message: error.message
        }
      });
    }
  }

  // Eliminar servicio
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      await servicioAdicionalService.eliminar(parseInt(id));

      res.status(204).send();

    } catch (error) {
      console.error('Error al eliminar servicio:', error);

      if (error.message.includes('asociado a reservas')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'SERVICIO_EN_USO',
            message: error.message
          }
        });
      }

      if (error.message.includes('no existe')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'SERVICIO_NO_ENCONTRADO',
            message: error.message
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ELIMINAR_SERVICIO',
          message: error.message
        }
      });
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(req, res) {
    try {
      const { hotelId } = req.query;

      const estadisticas = await servicioAdicionalService.obtenerEstadisticas(
        hotelId ? parseInt(hotelId) : null
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

module.exports = new ServicioAdicionalController();