const temporadaService = require('../services/temporadaService');

class TemporadaController {
    
    async crear(req, res) {
        try {
            const { hotel_id, nombre, fecha_inicio, fecha_fin, multiplicador_precio, descripcion } = req.body;
            const usuario = req.user?.username || 'SYSTEM';

            // Validaciones
            if (!hotel_id || !nombre || !fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'CAMPOS_REQUERIDOS',
                        message: 'hotel_id, nombre, fecha_inicio y fecha_fin son obligatorios'
                    }
                });
            }

            // Validar fechas
            const inicio = new Date(fecha_inicio);
            const fin = new Date(fecha_fin);
            
            if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'FECHAS_INVALIDAS',
                        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
                    }
                });
            }

            if (fin <= inicio) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'FECHAS_INVALIDAS',
                        message: 'La fecha fin debe ser posterior a la fecha inicio'
                    }
                });
            }

            // Validar multiplicador
            if (multiplicador_precio !== undefined && multiplicador_precio <= 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MULTIPLICADOR_INVALIDO',
                        message: 'El multiplicador debe ser mayor a cero'
                    }
                });
            }

            const data = { hotel_id, nombre, fecha_inicio, fecha_fin, multiplicador_precio, descripcion };
            const temporada = await temporadaService.crear(data, usuario);

            res.status(201).json({
                success: true,
                data: temporada
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'ID_INVALIDO', message: 'ID inválido' }
                });
            }

            const temporada = await temporadaService.obtenerPorId(parseInt(id));

            res.json({
                success: true,
                data: temporada
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async listar(req, res) {
        try {
            const { hotel_id } = req.query;

            let temporadas;

            if (hotel_id) {
                if (isNaN(hotel_id)) {
                    return res.status(400).json({
                        success: false,
                        error: { code: 'HOTEL_ID_INVALIDO', message: 'hotel_id debe ser un número' }
                    });
                }
                temporadas = await temporadaService.listarPorHotel(parseInt(hotel_id));
            } else {
                temporadas = await temporadaService.listar();
            }

            res.json({
                success: true,
                count: temporadas.length,
                data: temporadas
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async obtenerTemporadaVigente(req, res) {
        try {
            const { hotel_id, fecha } = req.query;

            if (!hotel_id || !fecha) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PARAMETROS_REQUERIDOS',
                        message: 'hotel_id y fecha son obligatorios'
                    }
                });
            }

            if (isNaN(hotel_id)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'HOTEL_ID_INVALIDO', message: 'hotel_id debe ser un número' }
                });
            }

            const fechaObj = new Date(fecha);
            if (isNaN(fechaObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'FECHA_INVALIDA',
                        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
                    }
                });
            }

            const temporada = await temporadaService.obtenerTemporadaVigente(parseInt(hotel_id), fecha);

            if (!temporada) {
                return res.json({
                    success: true,
                    data: null,
                    message: 'No hay temporada vigente para esta fecha'
                });
            }

            res.json({
                success: true,
                data: temporada
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { nombre, fecha_inicio, fecha_fin, multiplicador_precio, descripcion } = req.body;
            const usuario = req.user?.username || 'SYSTEM';

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'ID_INVALIDO', message: 'ID inválido' }
                });
            }

            // Validar fechas si se proporcionan ambas
            if (fecha_inicio && fecha_fin) {
                const inicio = new Date(fecha_inicio);
                const fin = new Date(fecha_fin);
                
                if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'FECHAS_INVALIDAS',
                            message: 'Formato de fecha inválido. Use YYYY-MM-DD'
                        }
                    });
                }

                if (fin <= inicio) {
                    return res.status(400).json({
                        success: false,
                        error: {
                            code: 'FECHAS_INVALIDAS',
                            message: 'La fecha fin debe ser posterior a la fecha inicio'
                        }
                    });
                }
            }

            // Validar multiplicador si se proporciona
            if (multiplicador_precio !== undefined && multiplicador_precio <= 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'MULTIPLICADOR_INVALIDO',
                        message: 'El multiplicador debe ser mayor a cero'
                    }
                });
            }

            const data = { nombre, fecha_inicio, fecha_fin, multiplicador_precio, descripcion };
            const temporada = await temporadaService.actualizar(parseInt(id), data, usuario);

            res.json({
                success: true,
                data: temporada
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async eliminar(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'ID_INVALIDO', message: 'ID inválido' }
                });
            }

            await temporadaService.eliminar(parseInt(id));

            res.status(204).send();
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async validarSolapamiento(req, res) {
        try {
            const { hotel_id, fecha_inicio, fecha_fin, temporada_id } = req.query;

            if (!hotel_id || !fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PARAMETROS_REQUERIDOS',
                        message: 'hotel_id, fecha_inicio y fecha_fin son obligatorios'
                    }
                });
            }

            if (isNaN(hotel_id)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'HOTEL_ID_INVALIDO', message: 'hotel_id debe ser un número' }
                });
            }

            const haySolapamiento = await temporadaService.validarSolapamiento(
                parseInt(hotel_id),
                fecha_inicio,
                fecha_fin,
                temporada_id ? parseInt(temporada_id) : null
            );

            res.json({
                success: true,
                data: {
                    hay_solapamiento: haySolapamiento,
                    mensaje: haySolapamiento 
                        ? 'Las fechas se solapan con otra temporada existente' 
                        : 'Las fechas están disponibles'
                }
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async calcularPrecioConTemporada(req, res) {
        try {
            const { hotel_id, precio_base, fecha } = req.query;

            if (!hotel_id || !precio_base || !fecha) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PARAMETROS_REQUERIDOS',
                        message: 'hotel_id, precio_base y fecha son obligatorios'
                    }
                });
            }

            if (isNaN(hotel_id) || isNaN(precio_base)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'PARAMETROS_INVALIDOS',
                        message: 'hotel_id y precio_base deben ser números'
                    }
                });
            }

            const resultado = await temporadaService.calcularPrecioConTemporada(
                parseInt(hotel_id),
                parseFloat(precio_base),
                fecha
            );

            res.json({
                success: true,
                data: resultado
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            const { hotel_id } = req.query;

            if (hotel_id && isNaN(hotel_id)) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'HOTEL_ID_INVALIDO', message: 'hotel_id debe ser un número' }
                });
            }

            const estadisticas = await temporadaService.obtenerEstadisticas(
                hotel_id ? parseInt(hotel_id) : null
            );

            res.json({
                success: true,
                data: estadisticas
            });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    manejarErrorRespuesta(res, error) {
        const statusMap = {
            'VALIDATION_ERROR': 400,
            'NOT_FOUND': 404,
            'OVERLAP_ERROR': 409,
            'DATABASE_ERROR': 500,
            'INTERNAL_ERROR': 500
        };
        const statusCode = statusMap[error.code] || 500;
        res.status(statusCode).json({
            success: false,
            error: {
                code: error.code || 'INTERNAL_ERROR',
                message: error.message || 'Error interno'
            }
        });
    }
}

module.exports = new TemporadaController();