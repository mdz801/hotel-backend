const hotelService = require('../services/hotelService');

/**
 * GET /api/hoteles
 * ?ciudad=&pais=
 */
async function listarHoteles(req, res) {
  try {
    const { ciudad, pais } = req.query;
    const hoteles = await hotelService.listarHoteles(ciudad, pais);
    res.json(hoteles);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: 'Error al listar hoteles',
      error: error.message
    });
  }
}

/**
 * GET /api/hoteles/:id
 */
async function obtenerHotel(req, res) {
  try {
    const idHotel = parseInt(req.params.id, 10);
    const hotel = await hotelService.obtenerHotelPorId(idHotel);

    if (!hotel) {
      return res.status(404).json({
        mensaje: 'Hotel no encontrado'
      });
    }

    res.json(hotel);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: 'Error al obtener hotel',
      error: error.message
    });
  }
}

/**
 * POST /api/hoteles
 */
async function crearHotel(req, res) {
  try {
    const data = {
      ...req.body,
      usuario: 'API_NODE'
    };

    await hotelService.crearHotel(data);

    res.status(201).json({
      mensaje: 'Hotel creado correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: 'Error al crear hotel',
      error: error.message
    });
  }
}

/**
 * PUT /api/hoteles/:id
 */
async function actualizarHotel(req, res) {
  try {
    await hotelService.actualizarHotel(
      Number(req.params.id),
      { ...req.body, usuario: 'API_NODE' }
    );

    res.json({ mensaje: 'Hotel actualizado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: 'Error al actualizar hotel',
      error: error.message
    });
  }
}

/**
 * DELETE /api/hoteles/:id
 */
async function eliminarHotel(req, res) {
  try {
    await hotelService.eliminarHotel(
      Number(req.params.id),
      'API_NODE'
    );

    res.json({ mensaje: 'Hotel eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      mensaje: 'Error al eliminar hotel',
      error: error.message
    });
  }
}

/**
 * PUT /api/hoteles/:id/admin
 */
async function actualizarHotelAdmin(req, res) {
  try {
    await hotelService.actualizarHotelAdmin(
      Number(req.params.id),
      { ...req.body, usuario: 'API_NODE_ADMIN' }
    );

    res.json({
      mensaje: 'Hotel actualizado correctamente (admin)'
    });

  } catch (error) {
    console.error('[actualizarHotelAdmin]', error);

    // Error Oracle: hotel no encontrado
    if (error.errorNum === 20002) {
      return res.status(404).json({
        mensaje: 'Hotel no encontrado'
      });
    }

    res.status(500).json({
      mensaje: 'Error al actualizar hotel (admin)',
      error: error.message
    });
  }
}

module.exports = {
  listarHoteles,
  obtenerHotel,
  crearHotel,
  actualizarHotel,
  eliminarHotel,
  actualizarHotelAdmin
};