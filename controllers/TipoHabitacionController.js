const tipoHabitacionService = require('../services/TipoHabitacionService');

class TipoHabitacionController {
    
    async crearTipoHabitacion(req, res) {
        try {
            const datos = req.body;
            const usuario = req.user?.username || 'SYSTEM';
            if (!datos.nombre?.trim()) return res.status(400).json({ success: false, message: 'Nombre obligatorio' });
            if (!datos.capacidad_adultos || datos.capacidad_adultos <= 0) return res.status(400).json({ success: false, message: 'Capacidad adultos debe ser mayor a cero' });
            const resultado = await tipoHabitacionService.crearTipoHabitacion(datos, usuario);
            res.status(201).json({ success: true, message: 'Tipo creado exitosamente', data: resultado });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async obtenerTipoPorId(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
            const tipo = await tipoHabitacionService.obtenerTipoPorId(parseInt(id));
            res.status(200).json({ success: true, data: tipo });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async listarTipos(req, res) {
        try {
            const tipos = await tipoHabitacionService.listarTipos();
            res.status(200).json({ success: true, count: tipos.length, data: tipos });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async listarTiposActivos(req, res) {
        try {
            const tipos = await tipoHabitacionService.listarTiposActivos();
            res.status(200).json({ success: true, count: tipos.length, data: tipos });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async actualizarTipoHabitacion(req, res) {
        try {
            const { id } = req.params;
            const datos = req.body;
            const usuario = req.user?.username || 'SYSTEM';
            if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
            const camposActualizables = ['nombre', 'descripcion', 'capacidad_adultos', 'capacidad_ninos', 'metros_cuadrados', 'tipo_cama', 'amenidades'];
            if (!camposActualizables.some(campo => datos[campo] !== undefined)) {
                return res.status(400).json({ success: false, message: 'Debe proporcionar al menos un campo para actualizar' });
            }
            const resultado = await tipoHabitacionService.actualizarTipoHabitacion(parseInt(id), datos, usuario);
            res.status(200).json({ success: true, message: 'Tipo actualizado exitosamente', data: resultado });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async eliminarTipoHabitacion(req, res) {
        try {
            const { id } = req.params;
            const usuario = req.user?.username || 'SYSTEM';
            if (!id || isNaN(id)) return res.status(400).json({ success: false, message: 'ID inválido' });
            const resultado = await tipoHabitacionService.eliminarTipoHabitacion(parseInt(id), usuario);
            res.status(200).json({ success: true, message: resultado.message });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async buscarPorNombre(req, res) {
        try {
            const { nombre } = req.query;
            if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'Parámetro nombre obligatorio' });
            const tipos = await tipoHabitacionService.buscarPorNombre(nombre);
            res.status(200).json({ success: true, count: tipos.length, data: tipos });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async obtenerPorCapacidad(req, res) {
        try {
            const { capacidad } = req.query;
            if (!capacidad || isNaN(capacidad) || parseInt(capacidad) <= 0) {
                return res.status(400).json({ success: false, message: 'Parámetro capacidad debe ser mayor a cero' });
            }
            const tipos = await tipoHabitacionService.obtenerPorCapacidad(parseInt(capacidad));
            res.status(200).json({ success: true, count: tipos.length, data: tipos });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async verificarNombreDisponible(req, res) {
        try {
            const { nombre, tipo_habitacion_id } = req.query;
            if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'Parámetro nombre obligatorio' });
            const resultado = await tipoHabitacionService.verificarNombreDisponible(nombre, tipo_habitacion_id ? parseInt(tipo_habitacion_id) : null);
            res.status(200).json({ success: true, data: resultado });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await tipoHabitacionService.obtenerEstadisticas();
            res.status(200).json({ success: true, data: estadisticas });
        } catch (error) {
            this.manejarErrorRespuesta(res, error);
        }
    }

    manejarErrorRespuesta(res, error) {
        const statusMap = { 'VALIDATION_ERROR': 400, 'DUPLICATE_NAME': 409, 'TIPO_NOT_FOUND': 404, 'HAS_DEPENDENCIES': 409, 'DATABASE_ERROR': 500, 'INTERNAL_ERROR': 500 };
        const statusCode = statusMap[error.code] || 500;
        res.status(statusCode).json({
            success: false,
            error: { code: error.code || 'INTERNAL_ERROR', message: error.message || 'Error interno', details: process.env.NODE_ENV === 'development' ? error.details : undefined }
        });
    }
}

module.exports = new TipoHabitacionController();