// controllers/experienciaController.js
const experienciaService = require('../services/experienciaService');

class ExperienciaController {
  
  // Crear experiencia
  async crear(req, res) {
    try {
      const { 
        hotelId, nombre, descripcion, tipo, duracionHoras, 
        capacidadMaxima, precioPersona, incluye, lugarSalida 
      } = req.body;

      // Validaciones
      if (!hotelId || !nombre || !precioPersona) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CAMPOS_REQUERIDOS',
            message: 'hotelId, nombre y precioPersona son obligatorios'
          }
        });
      }

      if (precioPersona <= 0) {
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
        tipo,
        duracionHoras,
        capacidadMaxima,
        precioPersona,
        incluye,
        lugarSalida,
        usuario: req.usuario?.email || 'SYSTEM'
      };

      const experiencia = await experienciaService.crear(data);

      res.status(201).json({
        success: true,
        data: experiencia
      });

    } catch (error) {
      console.error('Error al crear experiencia:', error);
      
      // Extraer solo el mensaje de error, no el objeto completo
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes('ya existe')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOMBRE_DUPLICADO',
            message: errorMessage
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_CREAR_EXPERIENCIA',
          message: errorMessage
        }
      });
    }
  }

  // Obtener experiencia por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const experiencia = await experienciaService.obtenerPorId(parseInt(id));

      if (!experiencia) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EXPERIENCIA_NO_ENCONTRADA',
            message: 'La experiencia no existe'
          }
        });
      }

      res.json({
        success: true,
        data: experiencia
      });

    } catch (error) {
      console.error('Error al obtener experiencia:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_OBTENER_EXPERIENCIA',
          message: errorMessage
        }
      });
    }
  }

  // Listar experiencias con filtros
  async listar(req, res) {
    try {
      const { hotelId, tipo, estado, nombre } = req.query;

      const filtros = {};
      if (hotelId) filtros.hotelId = parseInt(hotelId);
      if (tipo) filtros.tipo = tipo;
      if (estado) filtros.estado = estado.toUpperCase();
      if (nombre) filtros.nombre = nombre;

      const experiencias = await experienciaService.listar(filtros);

      res.json({
        success: true,
        data: experiencias,
        count: experiencias.length
      });

    } catch (error) {
      console.error('Error al listar experiencias:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_LISTAR_EXPERIENCIAS',
          message: errorMessage
        }
      });
    }
  }

  // Actualizar experiencia
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { 
        nombre, descripcion, tipo, duracionHoras, 
        capacidadMaxima, precioPersona, incluye, lugarSalida 
      } = req.body;

      if (precioPersona && precioPersona <= 0) {
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
        tipo,
        duracionHoras,
        capacidadMaxima,
        precioPersona,
        incluye,
        lugarSalida,
        usuario: req.usuario?.email || 'SYSTEM'
      };

      const experiencia = await experienciaService.actualizar(parseInt(id), data);

      res.json({
        success: true,
        data: experiencia
      });

    } catch (error) {
      console.error('Error al actualizar experiencia:', error);
      const errorMessage = error.message || error.toString();

      if (errorMessage.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EXPERIENCIA_NO_ENCONTRADA',
            message: errorMessage
          }
        });
      }

      if (errorMessage.includes('ya existe')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOMBRE_DUPLICADO',
            message: errorMessage
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ACTUALIZAR_EXPERIENCIA',
          message: errorMessage
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
      const experiencia = await experienciaService.cambiarEstado(
        parseInt(id),
        estado.toUpperCase(),
        usuario
      );

      res.json({
        success: true,
        data: experiencia,
        message: `Experiencia ${estado.toLowerCase()} exitosamente`
      });

    } catch (error) {
      console.error('Error al cambiar estado:', error);
      const errorMessage = error.message || error.toString();

      if (errorMessage.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EXPERIENCIA_NO_ENCONTRADA',
            message: errorMessage
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_CAMBIAR_ESTADO',
          message: errorMessage
        }
      });
    }
  }

  // Activar experiencia
  async activar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.email || 'SYSTEM';

      const experiencia = await experienciaService.cambiarEstado(
        parseInt(id),
        'ACTIVO',
        usuario
      );

      res.json({
        success: true,
        data: experiencia,
        message: 'Experiencia activada exitosamente'
      });

    } catch (error) {
      console.error('Error al activar experiencia:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ACTIVAR_EXPERIENCIA',
          message: errorMessage
        }
      });
    }
  }

  // Desactivar experiencia
  async desactivar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.email || 'SYSTEM';

      const experiencia = await experienciaService.cambiarEstado(
        parseInt(id),
        'INACTIVO',
        usuario
      );

      res.json({
        success: true,
        data: experiencia,
        message: 'Experiencia desactivada exitosamente'
      });

    } catch (error) {
      console.error('Error al desactivar experiencia:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_DESACTIVAR_EXPERIENCIA',
          message: errorMessage
        }
      });
    }
  }

  // Eliminar experiencia
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.email || 'SYSTEM';

      await experienciaService.eliminar(parseInt(id), usuario);

      res.status(204).send();

    } catch (error) {
      console.error('Error al eliminar experiencia:', error);
      const errorMessage = error.message || error.toString();

      if (errorMessage.includes('reservas asociadas')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'EXPERIENCIA_EN_USO',
            message: errorMessage
          }
        });
      }

      if (errorMessage.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'EXPERIENCIA_NO_ENCONTRADA',
            message: errorMessage
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_ELIMINAR_EXPERIENCIA',
          message: errorMessage
        }
      });
    }
  }

  // Verificar nombre disponible
  async verificarNombre(req, res) {
    try {
      const { hotelId, nombre, experienciaId } = req.query;

      if (!hotelId || !nombre) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PARAMETROS_REQUERIDOS',
            message: 'hotelId y nombre son obligatorios'
          }
        });
      }

      const disponible = await experienciaService.verificarNombreDisponible(
        parseInt(hotelId),
        nombre,
        experienciaId ? parseInt(experienciaId) : null
      );

      res.json({
        success: true,
        data: {
          disponible,
          mensaje: disponible 
            ? 'El nombre está disponible' 
            : 'El nombre ya está en uso'
        }
      });

    } catch (error) {
      console.error('Error al verificar nombre:', error);
      const errorMessage = error.message || error.toString();
      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_VERIFICAR_NOMBRE',
          message: errorMessage
        }
      });
    }
  }

  // Calcular precio total
  async calcularPrecio(req, res) {
    try {
      const { experienciaId, numeroPersonas } = req.query;

      if (!experienciaId || !numeroPersonas) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PARAMETROS_REQUERIDOS',
            message: 'experienciaId y numeroPersonas son obligatorios'
          }
        });
      }

      const total = await experienciaService.calcularPrecioTotal(
        parseInt(experienciaId),
        parseInt(numeroPersonas)
      );

      res.json({
        success: true,
        data: {
          experienciaId: parseInt(experienciaId),
          numeroPersonas: parseInt(numeroPersonas),
          precioTotal: total
        }
      });

    } catch (error) {
      console.error('Error al calcular precio:', error);
      const errorMessage = error.message || error.toString();

      if (errorMessage.includes('excede capacidad')) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CAPACIDAD_EXCEDIDA',
            message: errorMessage
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'ERROR_CALCULAR_PRECIO',
          message: errorMessage
        }
      });
    }
  }
}

module.exports = new ExperienciaController();