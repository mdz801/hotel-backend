const politicaCancelacionService = require('../services/politicaCancelacionService');

class PoliticaCancelacionController {
    
    async crear(req, res) {
        try {
            const { nombre, descripcion, dias_antes_checkin, porcentaje_penalidad, permite_reembolso } = req.body;
            
            if (!nombre || dias_antes_checkin === undefined || porcentaje_penalidad === undefined) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campos requeridos: nombre, dias_antes_checkin, porcentaje_penalidad' }
                });
            }
            
            const resultado = await politicaCancelacionService.crear(
                { nombre, descripcion, dias_antes_checkin, porcentaje_penalidad, permite_reembolso },
                req.usuario.email
            );
            
            res.status(201).json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async obtenerPorId(req, res) {
        try {
            const resultado = await politicaCancelacionService.obtenerPorId(req.params.id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            const status = error.code === 'NOT_FOUND' ? 404 : 400;
            res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async listar(req, res) {
        try {
            const resultado = await politicaCancelacionService.listar();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async actualizar(req, res) {
        try {
            const resultado = await politicaCancelacionService.actualizar(
                req.params.id,
                req.body,
                req.usuario.email
            );
            res.json({ success: true, data: resultado });
        } catch (error) {
            const status = error.code === 'NOT_FOUND' ? 404 : 400;
            res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async eliminar(req, res) {
        try {
            const resultado = await politicaCancelacionService.eliminar(req.params.id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            const status = error.code === 'NOT_FOUND' ? 404 : error.code === 'IN_USE' ? 409 : 400;
            res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async calcularPenalidad(req, res) {
        try {
            const { total_reserva, dias_restantes } = req.body;
            
            if (!total_reserva || dias_restantes === undefined) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campos requeridos: total_reserva, dias_restantes' }
                });
            }
            
            const resultado = await politicaCancelacionService.calcularPenalidad(
                req.params.id,
                total_reserva,
                dias_restantes
            );
            
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async puedeCancelar(req, res) {
        try {
            const { dias_restantes } = req.body;
            
            if (dias_restantes === undefined) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campo requerido: dias_restantes' }
                });
            }
            
            const resultado = await politicaCancelacionService.puedeCancelar(
                req.params.id,
                dias_restantes
            );
            
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async verificarNombreDisponible(req, res) {
        try {
            const { nombre, politica_id } = req.body;
            
            if (!nombre) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campo requerido: nombre' }
                });
            }
            
            const resultado = await politicaCancelacionService.verificarNombreDisponible(nombre, politica_id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }
}

module.exports = new PoliticaCancelacionController();