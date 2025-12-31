const reservaServicioService = require('../services/reservaServicioService');

class ReservaServicioController {
    
    async agregarServicio(req, res) {
        try {
            const datos = req.body;
            const usuario = req.user?.username || 'SYSTEM';
            
            if (!datos.reserva_id || !datos.servicio_id) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'reserva_id y servicio_id son obligatorios' 
                });
            }

            if (datos.cantidad && datos.cantidad <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cantidad debe ser mayor a cero' 
                });
            }

            const resultado = await reservaServicioService.agregarServicio(datos, usuario);
            res.status(201).json({ 
                success: true, 
                message: 'Servicio agregado exitosamente', 
                data: resultado 
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inválido' });
            }
            const servicio = await reservaServicioService.obtenerPorId(parseInt(id));
            res.status(200).json({ success: true, data: servicio });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async listarPorReserva(req, res) {
        try {
            const { reserva_id } = req.params;
            if (!reserva_id || isNaN(reserva_id)) {
                return res.status(400).json({ success: false, message: 'reserva_id inválido' });
            }
            const servicios = await reservaServicioService.listarPorReserva(parseInt(reserva_id));
            res.status(200).json({ success: true, count: servicios.length, data: servicios });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            const usuario = req.user?.username || 'SYSTEM';

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inválido' });
            }

            if (!estado) {
                return res.status(400).json({ success: false, message: 'Estado es obligatorio' });
            }

            const estadosValidos = ['PENDIENTE', 'CONFIRMADO', 'COMPLETADO', 'CANCELADO'];
            if (!estadosValidos.includes(estado)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Estado debe ser: ${estadosValidos.join(', ')}` 
                });
            }

            const resultado = await reservaServicioService.actualizarEstado(parseInt(id), estado, usuario);
            res.status(200).json({ 
                success: true, 
                message: 'Estado actualizado exitosamente', 
                data: resultado 
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async actualizarCantidad(req, res) {
        try {
            const { id } = req.params;
            const { cantidad } = req.body;
            const usuario = req.user?.username || 'SYSTEM';

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inválido' });
            }

            if (!cantidad || cantidad <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cantidad debe ser mayor a cero' 
                });
            }

            const resultado = await reservaServicioService.actualizarCantidad(parseInt(id), cantidad, usuario);
            res.status(200).json({ 
                success: true, 
                message: 'Cantidad actualizada exitosamente', 
                data: resultado 
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async cancelarServicio(req, res) {
        try {
            const { id } = req.params;
            const usuario = req.user?.username || 'SYSTEM';

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inválido' });
            }

            const resultado = await reservaServicioService.cancelarServicio(parseInt(id), usuario);
            res.status(200).json({ success: true, message: resultado.message });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async calcularTotalReserva(req, res) {
        try {
            const { reserva_id } = req.params;
            if (!reserva_id || isNaN(reserva_id)) {
                return res.status(400).json({ success: false, message: 'reserva_id inválido' });
            }
            const resultado = await reservaServicioService.calcularTotalReserva(parseInt(reserva_id));
            res.status(200).json({ success: true, data: resultado });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            const { reserva_id } = req.params;
            if (!reserva_id || isNaN(reserva_id)) {
                return res.status(400).json({ success: false, message: 'reserva_id inválido' });
            }
            const estadisticas = await reservaServicioService.obtenerEstadisticas(parseInt(reserva_id));
            res.status(200).json({ success: true, data: estadisticas });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    manejarErrorRespuesta(res, error) {
        const statusMap = {
            'VALIDATION_ERROR': 400,
            'NOT_FOUND': 404,
            'INVALID_STATE': 400,
            'DATABASE_ERROR': 500,
            'INTERNAL_ERROR': 500
        };
        const statusCode = statusMap[error.code] || 500;
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Error interno',
                details: process.env.NODE_ENV === 'development' ? error.details : undefined
            }
        });
    }
}

module.exports = new ReservaServicioController();