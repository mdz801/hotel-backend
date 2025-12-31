// controllers/reservaController.js
const reservaService = require('../services/reservaService');

/**
 * =====================================================
 * CREAR NUEVA RESERVA
 * POST /api/reservas
 * =====================================================
 */
exports.crear = async (req, res) => {
  try {
    // Obtener usuario del token JWT
    const usuario = req.usuario.username;
    
    // Agregar usuario a los datos
    const data = {
      ...req.body,
      usuarioCreacion: usuario
    };
    
    // Validar campos requeridos
    const camposRequeridos = [
      'hotelId', 
      'huespedId', 
      'fechaCheckin', 
      'fechaCheckout',
      'numeroAdultos',
      'subtotal',
      'impuestos',
      'total',
      'habitaciones'
    ];
    
    const camposFaltantes = camposRequeridos.filter(campo => !data[campo]);
    
    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${camposFaltantes.join(', ')}`
      });
    }
    
    // Validar que habitaciones sea un array y no esté vacío
    if (!Array.isArray(data.habitaciones) || data.habitaciones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe incluir al menos una habitación'
      });
    }
    
    // Crear reserva
    const resultado = await reservaService.crearReserva(data);
    
    res.status(201).json(resultado);
    
  } catch (error) {
    console.error('Error en controller crear:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear la reserva'
    });
  }
};

/**
 * =====================================================
 * OBTENER RESERVA POR ID
 * GET /api/reservas/:id
 * =====================================================
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva inválido'
      });
    }
    
    const reserva = await reservaService.obtenerPorId(id);
    
    if (!reserva) {
      return res.status(404).json({
        success: false,
        message: `Reserva con ID ${id} no encontrada`
      });
    }
    
    res.json({
      success: true,
      data: reserva
    });
    
  } catch (error) {
    console.error('Error en controller obtenerPorId:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener la reserva'
    });
  }
};

/**
 * =====================================================
 * LISTAR RESERVAS CON FILTROS
 * GET /api/reservas
 * 
 * Query params:
 * - hotelId (number)
 * - huespedId (number)
 * - estado (string)
 * - fechaDesde (YYYY-MM-DD)
 * - fechaHasta (YYYY-MM-DD)
 * - codigoReserva (string)
 * =====================================================
 */
exports.listar = async (req, res) => {
  try {
    // Construir objeto de filtros desde query params
    const filtros = {
      hotelId: req.query.hotelId ? parseInt(req.query.hotelId) : null,
      huespedId: req.query.huespedId ? parseInt(req.query.huespedId) : null,
      estado: req.query.estado,
      fechaDesde: req.query.fechaDesde,
      fechaHasta: req.query.fechaHasta,
      codigoReserva: req.query.codigoReserva
    };
    
    // Control de acceso por rol
    // Si el usuario no es ADMIN/GERENTE, solo ve reservas de su hotel
    const rol = req.usuario.rol;
    if (rol !== 'ADMIN' && rol !== 'GERENTE') {
      filtros.hotelId = req.usuario.hotelId;
    }
    
    // Validar estado si viene
    const estadosValidos = ['PENDIENTE', 'CONFIRMADA', 'CHECKIN', 'CHECKOUT', 'CANCELADA', 'NO_SHOW'];
    if (filtros.estado && !estadosValidos.includes(filtros.estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Estados válidos: ${estadosValidos.join(', ')}`
      });
    }
    
    const reservas = await reservaService.listar(filtros);
    
    res.json({
      success: true,
      count: reservas.length,
      data: reservas,
      filtros: filtros  // Retornar filtros aplicados
    });
    
  } catch (error) {
    console.error('Error en controller listar:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al listar las reservas'
    });
  }
};

/**
 * =====================================================
 * ACTUALIZAR RESERVA
 * PUT /api/reservas/:id
 * =====================================================
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario.username;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de reserva inválido'
      });
    }
    
    // Agregar usuario que modifica
    const data = {
      ...req.body,
      usuarioModificacion: usuario
    };
    
    // Validar que al menos un campo venga para actualizar
    const camposActualizables = [
      'fechaCheckin',
      'fechaCheckout',
      'numeroAdultos',
      'numeroNinos',
      'estado',
      'subtotal',
      'descuento',
      'impuestos',
      'total',
      'observaciones'
    ];
    
    const hayDatos = camposActualizables.some(campo => data[campo] !== undefined);
    
    if (!hayDatos) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar'
      });
    }
    
    const reserva = await reservaService.actualizar(id, data);
    
    res.json({
      success: true,
      data: reserva,
      message: 'Reserva actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error en controller actualizar:', error);
    
    // Diferentes códigos de estado según el error
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('no se puede modificar')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar la reserva'
    });
  }
};

/**
 * =====================================================
 * CAMBIOS DE ESTADO: confirmar, cancelar, checkin, checkout
 * =====================================================
 */
exports.confirmar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario.username;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de reserva inválido' });
    }

    const reserva = await reservaService.confirmar(parseInt(id), usuario);

    res.json({ success: true, message: 'Reserva confirmada', data: reserva });

  } catch (error) {
    console.error('Error en controller confirmar:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al confirmar reserva' });
  }
};

exports.cancelar = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const usuario = req.usuario.username;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de reserva inválido' });
    }

    if (!motivo || motivo.trim() === '') {
      return res.status(400).json({ success: false, message: 'Debe indicar el motivo de cancelación' });
    }

    const reserva = await reservaService.cancelar(parseInt(id), motivo.trim(), usuario);

    res.json({ success: true, message: 'Reserva cancelada', data: reserva });

  } catch (error) {
    console.error('Error en controller cancelar:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al cancelar reserva' });
  }
};

exports.checkin = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario.username;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de reserva inválido' });
    }

    const reserva = await reservaService.checkin(parseInt(id), usuario);

    res.json({ success: true, message: 'Check-in realizado', data: reserva });

  } catch (error) {
    console.error('Error en controller checkin:', error);
    res.status(500).json({ success: false, message: error.message || 'Error en check-in' });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.usuario.username;

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID de reserva inválido' });
    }

    const reserva = await reservaService.checkout(parseInt(id), usuario);

    res.json({ success: true, message: 'Check-out realizado', data: reserva });

  } catch (error) {
    console.error('Error en controller checkout:', error);
    res.status(500).json({ success: false, message: error.message || 'Error en check-out' });
  }
};

/**
 * =====================================================
 * DISPONIBILIDAD
 * =====================================================
 */
exports.verificarDisponibilidad = async (req, res) => {
  try {
    const { habitacionId, fechaCheckin, fechaCheckout, reservaIdExcluir } = req.query;

    if (!habitacionId || !fechaCheckin || !fechaCheckout) {
      return res.status(400).json({ success: false, message: 'Parámetros requeridos: habitacionId, fechaCheckin, fechaCheckout' });
    }

    const disponible = await reservaService.verificarDisponibilidad(parseInt(habitacionId), fechaCheckin, fechaCheckout, reservaIdExcluir ? parseInt(reservaIdExcluir) : null);

    res.json({ success: true, disponible });

  } catch (error) {
    console.error('Error en controller verificarDisponibilidad:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al verificar disponibilidad' });
  }
};

exports.buscarHabitacionesDisponibles = async (req, res) => {
  try {
    const { hotelId, fechaCheckin, fechaCheckout, capacidadAdultos } = req.query;

    if (!hotelId || !fechaCheckin || !fechaCheckout) {
      return res.status(400).json({ success: false, message: 'Parámetros requeridos: hotelId, fechaCheckin, fechaCheckout' });
    }

    const capacidad = capacidadAdultos ? parseInt(capacidadAdultos) : 1;

    const habitaciones = await reservaService.buscarHabitacionesDisponibles(parseInt(hotelId), fechaCheckin, fechaCheckout, capacidad);

    res.json({ success: true, count: habitaciones.length, data: habitaciones });

  } catch (error) {
    console.error('Error en controller buscarHabitacionesDisponibles:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al buscar habitaciones disponibles' });
  }
};