// controllers/huespedController.js
const huespedService = require('../services/huespedService');

/**
 * Listar huéspedes con filtros opcionales
 */
const listarHuespedes = async (req, res) => {
  try {
    const { ciudad, pais, membresia_id } = req.query;

    const huespedes = await huespedService.listarHuespedes({
      ciudad: ciudad || null,
      pais: pais || null,
      membresia_id: membresia_id ? parseInt(membresia_id) : null
    });

    res.json({
      success: true,
      count: huespedes.length,
      data: huespedes
    });

  } catch (error) {
    console.error('Error en listarHuespedes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar huéspedes',
      error: error.message
    });
  }
};

/**
 * Obtener huésped por ID
 */
const obtenerHuesped = async (req, res) => {
  try {
    const { id } = req.params;
    const huesped = await huespedService.obtenerHuespedPorId(parseInt(id));

    if (!huesped) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado'
      });
    }

    res.json({
      success: true,
      data: huesped
    });

  } catch (error) {
    console.error('Error en obtenerHuesped:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener huésped',
      error: error.message
    });
  }
};

/**
 * Buscar huésped por documento
 */
const buscarPorDocumento = async (req, res) => {
  try {
    const { tipo, numero } = req.params;

    const tiposValidos = ['DNI', 'PASAPORTE', 'CARNET_EXTRANJERIA', 'RUC'];
    if (!tiposValidos.includes(tipo.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Tipo de documento inválido. Use: ${tiposValidos.join(', ')}`
      });
    }

    const huesped = await huespedService.buscarPorDocumento(tipo.toUpperCase(), numero);

    if (!huesped) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado con ese documento'
      });
    }

    res.json({
      success: true,
      data: huesped
    });

  } catch (error) {
    console.error('Error en buscarPorDocumento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar huésped',
      error: error.message
    });
  }
};

/**
 * Crear nuevo huésped
 */
const crearHuesped = async (req, res) => {
  try {
    const {
      tipo_documento,
      numero_documento,
      nombres,
      apellidos,
      fecha_nacimiento,
      genero,
      email,
      telefono,
      direccion,
      ciudad,
      pais,
      membresia_id,
      preferencias
    } = req.body;

    // Validaciones
    if (!tipo_documento || !numero_documento || !nombres || !apellidos || !email) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: tipo_documento, numero_documento, nombres, apellidos, email'
      });
    }

    const tiposValidos = ['DNI', 'PASAPORTE', 'CARNET_EXTRANJERIA', 'RUC'];
    if (!tiposValidos.includes(tipo_documento.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Tipo de documento inválido. Use: ${tiposValidos.join(', ')}`
      });
    }

    if (genero && !['M', 'F', 'O'].includes(genero.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Género inválido. Use: M (Masculino), F (Femenino), O (Otro)'
      });
    }

    // Verificar si ya existe
    const existente = await huespedService.buscarPorDocumento(
      tipo_documento.toUpperCase(),
      numero_documento
    );

    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un huésped con ese documento',
        data: existente
      });
    }

    const nuevoHuesped = await huespedService.insertarHuesped({
      tipo_documento: tipo_documento.toUpperCase(),
      numero_documento: numero_documento.trim(),
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      fecha_nacimiento: fecha_nacimiento || null,
      genero: genero ? genero.toUpperCase() : 'O',
      email: email.trim().toLowerCase(),
      telefono: telefono?.trim() || null,
      direccion: direccion?.trim() || null,
      ciudad: ciudad?.trim() || null,
      pais: pais?.trim() || null,
      membresia_id: membresia_id ? parseInt(membresia_id) : null,
      preferencias: preferencias || null,
      usuario: req.usuario?.nombre || 'SYSTEM'
    });

    res.status(201).json({
      success: true,
      message: 'Huésped creado exitosamente',
      data: nuevoHuesped
    });

  } catch (error) {
    console.error('Error en crearHuesped:', error);
    
    if (error.message.includes('ORA-00001') || error.message.includes('unique constraint')) {
      return res.status(409).json({
        success: false,
        message: 'El documento o email ya está registrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear huésped',
      error: error.message
    });
  }
};

/**
 * Actualizar huésped
 */
const actualizarHuesped = async (req, res) => {
  try {
    const { id } = req.params;
    const huespedId = parseInt(id);

    const huespedExistente = await huespedService.obtenerHuespedPorId(huespedId);
    if (!huespedExistente) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado'
      });
    }

    const {
      nombres,
      apellidos,
      email,
      telefono,
      direccion,
      ciudad,
      pais,
      membresia_id,
      preferencias
    } = req.body;

    await huespedService.actualizarHuesped({
      id: huespedId,
      nombres: nombres?.trim() || null,
      apellidos: apellidos?.trim() || null,
      email: email?.trim().toLowerCase() || null,
      telefono: telefono?.trim() || null,
      direccion: direccion?.trim() || null,
      ciudad: ciudad?.trim() || null,
      pais: pais?.trim() || null,
      membresia_id: membresia_id ? parseInt(membresia_id) : null,
      preferencias: preferencias || null,
      usuario: req.usuario?.nombre || 'SYSTEM'
    });

    const huespedActualizado = await huespedService.obtenerHuespedPorId(huespedId);

    res.json({
      success: true,
      message: 'Huésped actualizado exitosamente',
      data: huespedActualizado
    });

  } catch (error) {
    console.error('Error en actualizarHuesped:', error);

    if (error.message.includes('ORA-00001') || error.message.includes('unique constraint')) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado por otro huésped'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar huésped',
      error: error.message
    });
  }
};

/**
 * Eliminar huésped (solo ADMIN)
 */
const eliminarHuesped = async (req, res) => {
  try {
    const { id } = req.params;
    const huespedId = parseInt(id);

    const huespedExistente = await huespedService.obtenerHuespedPorId(huespedId);
    if (!huespedExistente) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado'
      });
    }

    await huespedService.eliminarHuesped(
      huespedId,
      req.usuario?.nombre || 'SYSTEM'
    );

    res.json({
      success: true,
      message: 'Huésped eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en eliminarHuesped:', error);

    if (error.message.includes('ORA-20106') || error.message.includes('reservas activas')) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el huésped porque tiene reservas activas'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al eliminar huésped',
      error: error.message
    });
  }
};

/**
 * Consultar puntos de fidelización
 */
const consultarPuntos = async (req, res) => {
  try {
    const { id } = req.params;
    const huespedId = parseInt(id);

    const huespedExistente = await huespedService.obtenerHuespedPorId(huespedId);
    if (!huespedExistente) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado'
      });
    }

    const puntos = await huespedService.consultarPuntos(huespedId);

    res.json({
      success: true,
      data: {
        huesped_id: huespedId,
        nombres: huespedExistente.nombres,
        apellidos: huespedExistente.apellidos,
        puntos_acumulados: puntos,
        membresia: huespedExistente.membresia_nombre || 'Sin membresía'
      }
    });

  } catch (error) {
    console.error('Error en consultarPuntos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al consultar puntos',
      error: error.message
    });
  }
};

/**
 * Historial de movimientos de puntos
 */
const historialPuntos = async (req, res) => {
  try {
    const { id } = req.params;
    const huespedId = parseInt(id);

    const huespedExistente = await huespedService.obtenerHuespedPorId(huespedId);
    if (!huespedExistente) {
      return res.status(404).json({
        success: false,
        message: 'Huésped no encontrado'
      });
    }

    const historial = await huespedService.historialPuntos(huespedId);

    res.json({
      success: true,
      huesped: {
        id: huespedId,
        nombres: huespedExistente.nombres,
        apellidos: huespedExistente.apellidos,
        puntos_actuales: huespedExistente.puntos_acumulados
      },
      count: historial.length,
      data: historial
    });

  } catch (error) {
    console.error('Error en historialPuntos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de puntos',
      error: error.message
    });
  }
};

module.exports = {
  listarHuespedes,
  obtenerHuesped,
  buscarPorDocumento,
  crearHuesped,
  actualizarHuesped,
  eliminarHuesped,
  consultarPuntos,
  historialPuntos
};