const reservaExperienciaService = require('../services/reservaExperienciaService');

class ReservaExperienciaController {
    
    async agregarExperiencia(req, res) {
        try {
            const datos = req.body;
            const usuario = req.user?.username || 'SYSTEM';
            
            if (!datos.reserva_id || !datos.experiencia_id) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'reserva_id y experiencia_id son obligatorios' 
                });
            }

            if (datos.cantidad_personas && datos.cantidad_personas <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cantidad de personas debe ser mayor a cero' 
                });
            }

            const resultado = await reservaExperienciaService.agregarExperiencia(datos, usuario);
            res.status(201).json({ 
                success: true, 
                message: 'Experiencia agregada exitosamente', 
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
            const experiencia = await reservaExperienciaService.obtenerPorId(parseInt(id));
            res.status(200).json({ success: true, data: experiencia });
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
            const experiencias = await reservaExperienciaService.listarPorReserva(parseInt(reserva_id));
            res.status(200).json({ success: true, count: experiencias.length, data: experiencias });
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

            const resultado = await reservaExperienciaService.actualizarEstado(parseInt(id), estado, usuario);
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
            const { cantidad_personas } = req.body;
            const usuario = req.user?.username || 'SYSTEM';

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inválido' });
            }

            if (!cantidad_personas || cantidad_personas <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cantidad de personas debe ser mayor a cero' 
                });
            }

            const resultado = await reservaExperienciaService.actualizarCantidad(parseInt(id), cantidad_personas, usuario);
            res.status(200).json({ 
                success: true, 
                message: 'Cantidad actualizada exitosamente', 
                data: resultado 
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async actualizarFechaHora(req, res) {
        try {
            const { id } = req.params;
            const { fecha_hora_experiencia } = req.body;
            const usuario = req.user?.username || 'SYSTEM';

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inválido' });
            }

            if (!fecha_hora_experiencia) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'fecha_hora_experiencia es obligatoria' 
                });
            }

            const resultado = await reservaExperienciaService.actualizarFechaHora(parseInt(id), fecha_hora_experiencia, usuario);
            res.status(200).json({ 
                success: true, 
                message: 'Fecha/hora actualizada exitosamente', 
                data: resultado 
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async cancelarExperiencia(req, res) {
        try {
            const { id } = req.params;
            const usuario = req.user?.username || 'SYSTEM';

            if (!id || isNaN(id)) {
                return res.status(400).json({ success: false, message: 'ID inválido' });
            }

            const resultado = await reservaExperienciaService.cancelarExperiencia(parseInt(id), usuario);
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
            const resultado = await reservaExperienciaService.calcularTotalReserva(parseInt(reserva_id));
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
            const estadisticas = await reservaExperienciaService.obtenerEstadisticas(parseInt(reserva_id));
            res.status(200).json({ success: true, data: estadisticas });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async verificarCapacidad(req, res) {
        try {
            const { experiencia_id, fecha_hora_experiencia, cantidad_personas } = req.body;

            if (!experiencia_id || !fecha_hora_experiencia || !cantidad_personas) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'experiencia_id, fecha_hora_experiencia y cantidad_personas son obligatorios' 
                });
            }

            if (cantidad_personas <= 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Cantidad de personas debe ser mayor a cero' 
                });
            }

            const resultado = await reservaExperienciaService.verificarCapacidad(
                parseInt(experiencia_id), 
                fecha_hora_experiencia, 
                parseInt(cantidad_personas)
            );
            res.status(200).json({ success: true, data: resultado });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    manejarErrorRespuesta(res, error) {
        const statusMap = {
            'VALIDATION_ERROR': 400,
            'NOT_FOUND': 404,
            'INVALID_STATE': 400,
            'NO_CAPACITY': 409,
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

module.exports = new ReservaExperienciaController();