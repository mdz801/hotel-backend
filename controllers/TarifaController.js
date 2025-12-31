// controllers/tarifaController.js
const tarifaService = require('../services/tarifaService');

class TarifaController {
    
    // =====================================================
    // CREAR TARIFA
    // =====================================================
    async crear(req, res) {
        try {
            const { hotelId, tipoHabitacionId, precioBase, moneda, fechaVigenciaInicio, fechaVigenciaFin, estado } = req.body;
            
            // Validar campos requeridos
            if (!hotelId || !tipoHabitacionId || !precioBase || !fechaVigenciaInicio) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'DATOS_INCOMPLETOS',
                        message: 'Faltan datos requeridos: hotelId, tipoHabitacionId, precioBase, fechaVigenciaInicio'
                    }
                });
            }
            
            const tarifaData = {
                hotelId,
                tipoHabitacionId,
                precioBase,
                moneda: moneda || 'USD',
                fechaVigenciaInicio,
                fechaVigenciaFin: fechaVigenciaFin || null,
                estado: estado || 'ACTIVA',
                usuario: req.usuario?.email || 'SYSTEM'
            };
            
            const tarifa = await tarifaService.crear(tarifaData);
            
            res.status(201).json({
                success: true,
                data: tarifa
            });
            
        } catch (error) {
            console.error('Error en TarifaController.crear:', error);
            
            // Manejar errores específicos de Oracle
            if (error.errorNum) {
                const errorMap = {
                    20001: 'El ID del hotel es obligatorio',
                    20002: 'El ID del tipo de habitación es obligatorio',
                    20003: 'El precio base debe ser mayor a cero',
                    20004: 'La fecha de inicio de vigencia es obligatoria',
                    20005: 'El hotel no existe',
                    20006: 'El tipo de habitación no existe',
                    20007: 'La fecha fin debe ser posterior a la fecha inicio',
                    20008: 'El estado debe ser ACTIVA o INACTIVA',
                    20009: 'Ya existe una tarifa activa para este período'
                };
                
                return res.status(400).json({
                    success: false,
                    error: {
                        code: `ORACLE_${error.errorNum}`,
                        message: errorMap[error.errorNum] || error.message
                    }
                });
            }
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al crear la tarifa'
                }
            });
        }
    }
    
    // =====================================================
    // OBTENER TARIFA POR ID
    // =====================================================
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            
            const tarifa = await tarifaService.obtenerPorId(id);
            
            if (!tarifa) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'La tarifa no existe'
                    }
                });
            }
            
            res.json({
                success: true,
                data: tarifa
            });
            
        } catch (error) {
            console.error('Error en TarifaController.obtenerPorId:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al obtener la tarifa'
                }
            });
        }
    }
    
    // =====================================================
    // LISTAR TARIFAS CON FILTROS
    // =====================================================
    async listar(req, res) {
        try {
            const { hotelId, tipoHabitacionId, estado, soloActivas } = req.query;
            
            const filtros = {};
            
            if (hotelId) filtros.hotelId = hotelId;
            if (tipoHabitacionId) filtros.tipoHabitacionId = tipoHabitacionId;
            if (estado) filtros.estado = estado;
            if (soloActivas) filtros.soloActivas = soloActivas;
            
            const tarifas = await tarifaService.listar(filtros);
            
            res.json({
                success: true,
                data: tarifas,
                count: tarifas.length
            });
            
        } catch (error) {
            console.error('Error en TarifaController.listar:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al listar las tarifas'
                }
            });
        }
    }
    
    // =====================================================
    // OBTENER TARIFA VIGENTE
    // =====================================================
    async obtenerTarifaVigente(req, res) {
        try {
            const { hotelId, tipoHabitacionId } = req.query;
            const { fecha } = req.query; // Formato: YYYY-MM-DD
            
            if (!hotelId || !tipoHabitacionId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'DATOS_INCOMPLETOS',
                        message: 'Se requiere hotelId y tipoHabitacionId'
                    }
                });
            }
            
            const tarifa = await tarifaService.obtenerTarifaVigente(hotelId, tipoHabitacionId, fecha);
            
            if (!tarifa) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'No hay tarifa vigente para este tipo de habitación en la fecha especificada'
                    }
                });
            }
            
            res.json({
                success: true,
                data: tarifa
            });
            
        } catch (error) {
            console.error('Error en TarifaController.obtenerTarifaVigente:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al obtener la tarifa vigente'
                }
            });
        }
    }
    
    // =====================================================
    // OBTENER HISTORIAL DE TARIFAS
    // =====================================================
    async obtenerHistorial(req, res) {
        try {
            const { hotelId, tipoHabitacionId } = req.query;
            
            if (!hotelId || !tipoHabitacionId) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'DATOS_INCOMPLETOS',
                        message: 'Se requiere hotelId y tipoHabitacionId'
                    }
                });
            }
            
            const historial = await tarifaService.obtenerHistorial(hotelId, tipoHabitacionId);
            
            res.json({
                success: true,
                data: historial,
                count: historial.length
            });
            
        } catch (error) {
            console.error('Error en TarifaController.obtenerHistorial:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al obtener el historial de tarifas'
                }
            });
        }
    }
    
    // =====================================================
    // ACTUALIZAR TARIFA
    // =====================================================
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { precioBase, moneda, fechaVigenciaInicio, fechaVigenciaFin, estado } = req.body;
            
            // Verificar que la tarifa existe
            const tarifaExistente = await tarifaService.obtenerPorId(id);
            if (!tarifaExistente) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'La tarifa no existe'
                    }
                });
            }
            
            const tarifaData = {
                precioBase: precioBase || null,
                moneda: moneda || null,
                fechaVigenciaInicio: fechaVigenciaInicio || null,
                fechaVigenciaFin: fechaVigenciaFin || null,
                estado: estado || null,
                usuario: req.usuario?.email || 'SYSTEM'
            };
            
            const tarifaActualizada = await tarifaService.actualizar(id, tarifaData);
            
            res.json({
                success: true,
                data: tarifaActualizada
            });
            
        } catch (error) {
            console.error('Error en TarifaController.actualizar:', error);
            
            if (error.errorNum) {
                const errorMap = {
                    20003: 'El precio base debe ser mayor a cero',
                    20007: 'La fecha fin debe ser posterior a la fecha inicio',
                    20008: 'El estado debe ser ACTIVA o INACTIVA',
                    20009: 'Ya existe una tarifa activa para este período',
                    20010: 'La tarifa no existe'
                };
                
                return res.status(400).json({
                    success: false,
                    error: {
                        code: `ORACLE_${error.errorNum}`,
                        message: errorMap[error.errorNum] || error.message
                    }
                });
            }
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al actualizar la tarifa'
                }
            });
        }
    }
    
    // =====================================================
    // ELIMINAR TARIFA (SOFT DELETE)
    // =====================================================
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que la tarifa existe
            const tarifaExistente = await tarifaService.obtenerPorId(id);
            if (!tarifaExistente) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'La tarifa no existe'
                    }
                });
            }
            
            const usuario = req.usuario?.email || 'SYSTEM';
            await tarifaService.eliminar(id, usuario);
            
            res.status(200).json({
                success: true,
                message: 'Tarifa eliminada correctamente'
            });
            
        } catch (error) {
            console.error('Error en TarifaController.eliminar:', error);
            
            if (error.errorNum === 20010) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'La tarifa no existe'
                    }
                });
            }
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al eliminar la tarifa'
                }
            });
        }
    }
    
    // =====================================================
    // ACTIVAR TARIFA
    // =====================================================
    async activar(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que la tarifa existe
            const tarifaExistente = await tarifaService.obtenerPorId(id);
            if (!tarifaExistente) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'La tarifa no existe'
                    }
                });
            }
            
            const usuario = req.usuario?.email || 'SYSTEM';
            const tarifaActualizada = await tarifaService.activar(id, usuario);
            
            res.json({
                success: true,
                data: tarifaActualizada,
                message: 'Tarifa activada correctamente'
            });
            
        } catch (error) {
            console.error('Error en TarifaController.activar:', error);
            
            if (error.errorNum === 20010) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'La tarifa no existe'
                    }
                });
            }
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al activar la tarifa'
                }
            });
        }
    }
    
    // =====================================================
    // DESACTIVAR TARIFA
    // =====================================================
    async desactivar(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que la tarifa existe
            const tarifaExistente = await tarifaService.obtenerPorId(id);
            if (!tarifaExistente) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'La tarifa no existe'
                    }
                });
            }
            
            const usuario = req.usuario?.email || 'SYSTEM';
            const tarifaActualizada = await tarifaService.desactivar(id, usuario);
            
            res.json({
                success: true,
                data: tarifaActualizada,
                message: 'Tarifa desactivada correctamente'
            });
            
        } catch (error) {
            console.error('Error en TarifaController.desactivar:', error);
            
            if (error.errorNum === 20010) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'TARIFA_NO_ENCONTRADA',
                        message: 'La tarifa no existe'
                    }
                });
            }
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al desactivar la tarifa'
                }
            });
        }
    }
    
    // =====================================================
    // VALIDAR SOLAPAMIENTO
    // =====================================================
    async validarSolapamiento(req, res) {
        try {
            const { hotelId, tipoHabitacionId, fechaInicio, fechaFin, tarifaIdExcluir } = req.query;
            
            if (!hotelId || !tipoHabitacionId || !fechaInicio) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'DATOS_INCOMPLETOS',
                        message: 'Se requiere hotelId, tipoHabitacionId y fechaInicio'
                    }
                });
            }
            
            const resultado = await tarifaService.validarSolapamiento(
                hotelId,
                tipoHabitacionId,
                fechaInicio,
                fechaFin || null,
                tarifaIdExcluir || null
            );
            
            res.json({
                success: true,
                data: resultado
            });
            
        } catch (error) {
            console.error('Error en TarifaController.validarSolapamiento:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al validar solapamiento'
                }
            });
        }
    }
    
    // =====================================================
    // OBTENER ESTADÍSTICAS
    // =====================================================
    async obtenerEstadisticas(req, res) {
        try {
            const { hotelId } = req.query;
            
            const estadisticas = await tarifaService.obtenerEstadisticas(hotelId || null);
            
            if (!estadisticas) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'NO_HAY_DATOS',
                        message: 'No hay estadísticas disponibles'
                    }
                });
            }
            
            res.json({
                success: true,
                data: estadisticas
            });
            
        } catch (error) {
            console.error('Error en TarifaController.obtenerEstadisticas:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ERROR_SERVIDOR',
                    message: 'Error al obtener estadísticas'
                }
            });
        }
    }
}

module.exports = new TarifaController();