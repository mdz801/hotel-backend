const calificacionService = require('../services/calificacionService');

// Función helper segura para extraer mensajes de error
function extraerMensaje(error) {
    // Si es string directo, retornarlo
    if (typeof error === 'string') {
        return error;
    }
    
    // Si tiene message como string, usarlo
    if (error.message && typeof error.message === 'string') {
        return error.message;
    }
    
    // Si es error de Oracle con errorNum
    if (error.errorNum) {
        return `Error de base de datos: ${error.errorNum}`;
    }
    
    // Si tiene code
    if (error.code) {
        return `Error: ${error.code}`;
    }
    
    // Fallback genérico
    return 'Error interno del servidor';
}

class CalificacionController {
    
    async obtenerPorId(req, res) {
        try {
            const resultado = await calificacionService.obtenerPorId(req.params.id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            console.error('Error en obtenerPorId controller:', error.code, error.message);
            const status = error.code === 'NOT_FOUND' ? 404 : 400;
            res.status(status).json({ 
                success: false, 
                error: { 
                    code: error.code || 'INTERNAL_ERROR',
                    message: error.message || 'Error desconocido'
                } 
            });
        }
    }

    async listarPorHotel(req, res) {
        try {
            const filtros = {
                puntuacion_minima: req.query.puntuacion_minima
            };
            
            const resultado = await calificacionService.listarPorHotel(req.params.hotelId, filtros);
            res.json({ success: true, data: resultado });
        } catch (error) {
            console.error('Error en listarPorHotel controller:', error.code, error.message);
            res.status(400).json({ 
                success: false, 
                error: { 
                    code: error.code || 'INTERNAL_ERROR',
                    message: error.message || 'Error desconocido'
                } 
            });
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            const resultado = await calificacionService.obtenerEstadisticasHotel(req.params.hotelId);
            res.json({ success: true, data: resultado });
        } catch (error) {
            console.error('Error en obtenerEstadisticas controller:', error.code, error.message);
            res.status(400).json({ 
                success: false, 
                error: { 
                    code: error.code || 'INTERNAL_ERROR',
                    message: error.message || 'Error desconocido'
                } 
            });
        }
    }

    async responder(req, res) {
        try {
            const { respuesta_hotel } = req.body;
            
            if (!respuesta_hotel) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campo requerido: respuesta_hotel' }
                });
            }
            
            const resultado = await calificacionService.responder(
                req.params.id,
                respuesta_hotel,
                req.usuario.email
            );
            
            res.json({ success: true, data: resultado });
        } catch (error) {
            console.error('Error en responder controller:', error.code, error.message);
            const status = error.code === 'NOT_FOUND' ? 404 : 400;
            res.status(status).json({ 
                success: false, 
                error: { 
                    code: error.code || 'INTERNAL_ERROR',
                    message: error.message || 'Error desconocido'
                } 
            });
        }
    }

    async eliminar(req, res) {
        try {
            const resultado = await calificacionService.eliminar(req.params.id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            console.error('Error en eliminar controller:', error.code, error.message);
            const status = error.code === 'NOT_FOUND' ? 404 : 400;
            res.status(status).json({ 
                success: false, 
                error: { 
                    code: error.code || 'INTERNAL_ERROR',
                    message: error.message || 'Error desconocido'
                } 
            });
        }
    }
}

module.exports = new CalificacionController();