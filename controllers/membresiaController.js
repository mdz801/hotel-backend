const membresiaService = require('../services/membresiaService');

class MembresiaController {
    
    async crear(req, res) {
        try {
            const { nombre, nivel, descuento_porcentaje, puntos_por_dolar, beneficios, puntos_minimos } = req.body;
            
            if (!nombre || nivel === undefined) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campos requeridos: nombre, nivel' }
                });
            }
            
            const resultado = await membresiaService.crear(
                { nombre, nivel, descuento_porcentaje, puntos_por_dolar, beneficios, puntos_minimos },
                req.usuario.email
            );
            
            res.status(201).json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async obtenerPorId(req, res) {
        try {
            const resultado = await membresiaService.obtenerPorId(req.params.id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            const status = error.code === 'NOT_FOUND' ? 404 : 400;
            res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async listar(req, res) {
        try {
            const resultado = await membresiaService.listar();
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async actualizar(req, res) {
        try {
            const resultado = await membresiaService.actualizar(
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
            const resultado = await membresiaService.eliminar(req.params.id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            const status = error.code === 'NOT_FOUND' ? 404 : error.code === 'IN_USE' ? 409 : 400;
            res.status(status).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async calcularDescuento(req, res) {
        try {
            const { monto_total } = req.body;
            
            if (!monto_total) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campo requerido: monto_total' }
                });
            }
            
            const resultado = await membresiaService.calcularDescuento(req.params.id, monto_total);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async calcularPuntosGanados(req, res) {
        try {
            const { monto_gastado } = req.body;
            
            if (!monto_gastado) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campo requerido: monto_gastado' }
                });
            }
            
            const resultado = await membresiaService.calcularPuntosGanados(req.params.id, monto_gastado);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async obtenerMembresiaPorPuntos(req, res) {
        try {
            const { puntos_acumulados } = req.body;
            
            if (puntos_acumulados === undefined) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campo requerido: puntos_acumulados' }
                });
            }
            
            const resultado = await membresiaService.obtenerMembresiaPorPuntos(puntos_acumulados);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async verificarNombreDisponible(req, res) {
        try {
            const { nombre, membresia_id } = req.body;
            
            if (!nombre) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campo requerido: nombre' }
                });
            }
            
            const resultado = await membresiaService.verificarNombreDisponible(nombre, membresia_id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }

    async verificarNivelDisponible(req, res) {
        try {
            const { nivel, membresia_id } = req.body;
            
            if (nivel === undefined) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELDS', message: 'Campo requerido: nivel' }
                });
            }
            
            const resultado = await membresiaService.verificarNivelDisponible(nivel, membresia_id);
            res.json({ success: true, data: resultado });
        } catch (error) {
            res.status(400).json({ success: false, error: { code: error.code, message: error.message } });
        }
    }
}

module.exports = new MembresiaController();