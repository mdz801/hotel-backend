// services/tarifaService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class TarifaService {
    
    // =====================================================
    // CREAR TARIFA
    // =====================================================
    async crear(tarifaData) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            // Preparar el SQL dependiendo si hay fecha fin o no
            const sqlQuery = tarifaData.fechaVigenciaFin 
                ? `BEGIN
                    PKG_TARIFA.sp_crear_tarifa(
                        p_hotel_id => :hotel_id,
                        p_tipo_habitacion_id => :tipo_habitacion_id,
                        p_precio_base => :precio_base,
                        p_moneda => :moneda,
                        p_fecha_vigencia_inicio => TO_DATE(:fecha_vigencia_inicio, 'YYYY-MM-DD'),
                        p_fecha_vigencia_fin => TO_DATE(:fecha_vigencia_fin, 'YYYY-MM-DD'),
                        p_estado => :estado,
                        p_usuario => :usuario,
                        p_tarifa_id => :tarifa_id
                    );
                END;`
                : `BEGIN
                    PKG_TARIFA.sp_crear_tarifa(
                        p_hotel_id => :hotel_id,
                        p_tipo_habitacion_id => :tipo_habitacion_id,
                        p_precio_base => :precio_base,
                        p_moneda => :moneda,
                        p_fecha_vigencia_inicio => TO_DATE(:fecha_vigencia_inicio, 'YYYY-MM-DD'),
                        p_fecha_vigencia_fin => NULL,
                        p_estado => :estado,
                        p_usuario => :usuario,
                        p_tarifa_id => :tarifa_id
                    );
                END;`;
            
            const binds = {
                hotel_id: tarifaData.hotelId,
                tipo_habitacion_id: tarifaData.tipoHabitacionId,
                precio_base: tarifaData.precioBase,
                moneda: tarifaData.moneda || 'USD',
                fecha_vigencia_inicio: tarifaData.fechaVigenciaInicio,
                estado: tarifaData.estado || 'ACTIVA',
                usuario: tarifaData.usuario || 'SYSTEM',
                tarifa_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            };
            
            // Agregar fecha_vigencia_fin solo si existe
            if (tarifaData.fechaVigenciaFin) {
                binds.fecha_vigencia_fin = tarifaData.fechaVigenciaFin;
            }
            
            const result = await connection.execute(sqlQuery, binds);
            
            const tarifaId = result.outBinds.tarifa_id;
            
            // Obtener la tarifa creada con todos sus datos
            const tarifaCreada = await this.obtenerPorId(tarifaId);
            
            return tarifaCreada;
            
        } catch (error) {
            console.error('Error en TarifaService.crear:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // OBTENER TARIFA POR ID
    // =====================================================
    async obtenerPorId(tarifaId) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const binds = {
                tarifa_id: tarifaId,
                cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            };
            
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TARIFA.fn_obtener_tarifa_por_id(:tarifa_id); END;`,
                binds
            );
            
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(1);
            await resultSet.close();
            
            if (rows.length === 0) {
                return null;
            }
            
            return this.mapearTarifa(rows[0]);
            
        } catch (error) {
            console.error('Error en TarifaService.obtenerPorId:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // LISTAR TARIFAS CON FILTROS
    // =====================================================
    async listar(filtros = {}) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            let query;
            let binds = {};
            
            // Determinar qué función llamar según los filtros
            if (filtros.hotelId) {
                query = `BEGIN :cursor := PKG_TARIFA.fn_listar_por_hotel(:hotel_id); END;`;
                binds.hotel_id = filtros.hotelId;
            } else if (filtros.tipoHabitacionId) {
                query = `BEGIN :cursor := PKG_TARIFA.fn_listar_por_tipo_habitacion(:tipo_habitacion_id); END;`;
                binds.tipo_habitacion_id = filtros.tipoHabitacionId;
            } else if (filtros.soloActivas === 'true' || filtros.soloActivas === true) {
                query = `BEGIN :cursor := PKG_TARIFA.fn_listar_tarifas_activas(); END;`;
            } else {
                query = `BEGIN :cursor := PKG_TARIFA.fn_listar_tarifas(); END;`;
            }
            
            // Agregar el cursor como binding
            binds.cursor = { dir: oracledb.BIND_OUT, type: oracledb.CURSOR };
            
            const result = await connection.execute(query, binds);
            const resultSet = result.outBinds.cursor;
            
            // Obtener todas las filas del cursor
            const rows = await resultSet.getRows(1000);
            await resultSet.close();
            
            // Filtrar adicionales en memoria si es necesario
            let tarifas = rows.map(row => this.mapearTarifa(row));
            
            if (filtros.estado && !filtros.soloActivas) {
                tarifas = tarifas.filter(t => t.estado === filtros.estado);
            }
            
            console.log('✅ Tarifas encontradas:', tarifas.length);
            return tarifas;
            
        } catch (error) {
            console.error('❌ Error en TarifaService.listar:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // OBTENER TARIFA VIGENTE
    // =====================================================
    async obtenerTarifaVigente(hotelId, tipoHabitacionId, fecha = null) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
            
            const binds = {
                hotel_id: hotelId,
                tipo_habitacion_id: tipoHabitacionId,
                fecha: fechaConsulta,
                cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            };
            
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TARIFA.fn_obtener_tarifa_vigente(:hotel_id, :tipo_habitacion_id, TO_DATE(:fecha, 'YYYY-MM-DD')); END;`,
                binds
            );
            
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(1);
            await resultSet.close();
            
            if (rows.length === 0) {
                return null;
            }
            
            return this.mapearTarifa(rows[0]);
            
        } catch (error) {
            console.error('❌ Error en TarifaService.obtenerTarifaVigente:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // OBTENER HISTORIAL DE TARIFAS
    // =====================================================
    async obtenerHistorial(hotelId, tipoHabitacionId) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const binds = {
                hotel_id: hotelId,
                tipo_habitacion_id: tipoHabitacionId,
                cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            };
            
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TARIFA.fn_obtener_historial_tarifas(:hotel_id, :tipo_habitacion_id); END;`,
                binds
            );
            
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(1000);
            await resultSet.close();
            
            const historial = rows.map(row => this.mapearTarifa(row));
            
            return historial;
            
        } catch (error) {
            console.error('❌ Error en TarifaService.obtenerHistorial:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // ACTUALIZAR TARIFA
    // =====================================================
    async actualizar(tarifaId, tarifaData) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            // Construir SQL dinámicamente según campos presentes
            let sqlParams = [];
            let binds = {
                tarifa_id: tarifaId,
                usuario: tarifaData.usuario || 'SYSTEM'
            };
            
            if (tarifaData.precioBase) {
                sqlParams.push('p_precio_base => :precio_base');
                binds.precio_base = tarifaData.precioBase;
            } else {
                sqlParams.push('p_precio_base => NULL');
            }
            
            if (tarifaData.moneda) {
                sqlParams.push('p_moneda => :moneda');
                binds.moneda = tarifaData.moneda;
            } else {
                sqlParams.push('p_moneda => NULL');
            }
            
            if (tarifaData.fechaVigenciaInicio) {
                sqlParams.push('p_fecha_vigencia_inicio => TO_DATE(:fecha_vigencia_inicio, \'YYYY-MM-DD\')');
                binds.fecha_vigencia_inicio = tarifaData.fechaVigenciaInicio;
            } else {
                sqlParams.push('p_fecha_vigencia_inicio => NULL');
            }
            
            if (tarifaData.fechaVigenciaFin) {
                sqlParams.push('p_fecha_vigencia_fin => TO_DATE(:fecha_vigencia_fin, \'YYYY-MM-DD\')');
                binds.fecha_vigencia_fin = tarifaData.fechaVigenciaFin;
            } else {
                sqlParams.push('p_fecha_vigencia_fin => NULL');
            }
            
            if (tarifaData.estado) {
                sqlParams.push('p_estado => :estado');
                binds.estado = tarifaData.estado;
            } else {
                sqlParams.push('p_estado => NULL');
            }
            
            const sqlQuery = `BEGIN
                PKG_TARIFA.sp_actualizar_tarifa(
                    p_tarifa_id => :tarifa_id,
                    ${sqlParams.join(',\n                    ')},
                    p_usuario => :usuario
                );
            END;`;
            
            await connection.execute(sqlQuery, binds);
            
            // Obtener la tarifa actualizada
            const tarifaActualizada = await this.obtenerPorId(tarifaId);
            
            return tarifaActualizada;
            
        } catch (error) {
            console.error('Error en TarifaService.actualizar:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // ELIMINAR TARIFA (SOFT DELETE)
    // =====================================================
    async eliminar(tarifaId, usuario = 'SYSTEM') {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            await connection.execute(
                `BEGIN
                    PKG_TARIFA.sp_eliminar_tarifa(
                        p_tarifa_id => :tarifa_id,
                        p_usuario => :usuario
                    );
                END;`,
                {
                    tarifa_id: tarifaId,
                    usuario: usuario
                }
            );
            
            return { message: 'Tarifa eliminada correctamente' };
            
        } catch (error) {
            console.error('Error en TarifaService.eliminar:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // ACTIVAR TARIFA
    // =====================================================
    async activar(tarifaId, usuario = 'SYSTEM') {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            await connection.execute(
                `BEGIN
                    PKG_TARIFA.sp_activar_tarifa(
                        p_tarifa_id => :tarifa_id,
                        p_usuario => :usuario
                    );
                END;`,
                {
                    tarifa_id: tarifaId,
                    usuario: usuario
                }
            );
            
            // Obtener la tarifa actualizada
            const tarifaActualizada = await this.obtenerPorId(tarifaId);
            
            return tarifaActualizada;
            
        } catch (error) {
            console.error('Error en TarifaService.activar:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // DESACTIVAR TARIFA
    // =====================================================
    async desactivar(tarifaId, usuario = 'SYSTEM') {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            await connection.execute(
                `BEGIN
                    PKG_TARIFA.sp_desactivar_tarifa(
                        p_tarifa_id => :tarifa_id,
                        p_usuario => :usuario
                    );
                END;`,
                {
                    tarifa_id: tarifaId,
                    usuario: usuario
                }
            );
            
            // Obtener la tarifa actualizada
            const tarifaActualizada = await this.obtenerPorId(tarifaId);
            
            return tarifaActualizada;
            
        } catch (error) {
            console.error('Error en TarifaService.desactivar:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // VALIDAR SOLAPAMIENTO
    // =====================================================
    async validarSolapamiento(hotelId, tipoHabitacionId, fechaInicio, fechaFin = null, tarifaIdExcluir = null) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const sqlQuery = `SELECT PKG_TARIFA.fn_validar_solapamiento(
                :hotel_id,
                :tipo_habitacion_id,
                TO_DATE(:fecha_inicio, 'YYYY-MM-DD'),
                ${fechaFin ? 'TO_DATE(:fecha_fin, \'YYYY-MM-DD\')' : 'NULL'},
                :tarifa_id_excluir
            ) AS tiene_solapamiento FROM DUAL`;
            
            const binds = {
                hotel_id: hotelId,
                tipo_habitacion_id: tipoHabitacionId,
                fecha_inicio: fechaInicio,
                tarifa_id_excluir: tarifaIdExcluir || null
            };
            
            if (fechaFin) {
                binds.fecha_fin = fechaFin;
            }
            
            const result = await connection.execute(sqlQuery, binds);
            
            const tieneSolapamiento = result.rows[0][0] > 0;
            
            return {
                tieneSolapamiento,
                mensaje: tieneSolapamiento 
                    ? 'Ya existe una tarifa activa para este período' 
                    : 'No hay solapamiento de fechas'
            };
            
        } catch (error) {
            console.error('Error en TarifaService.validarSolapamiento:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // OBTENER ESTADÍSTICAS
    // =====================================================
    async obtenerEstadisticas(hotelId = null) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT * FROM TABLE(PKG_TARIFA.fn_obtener_estadisticas(:hotel_id))`,
                { hotel_id: hotelId }
            );
            
            if (result.rows.length === 0) {
                return null;
            }
            
            return this.mapearEstadisticas(result.rows[0], result.metaData);
            
        } catch (error) {
            console.error('Error en TarifaService.obtenerEstadisticas:', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (err) {
                    console.error('Error al cerrar conexión:', err);
                }
            }
        }
    }
    
    // =====================================================
    // MAPEAR TARIFA (de Oracle a JSON)
    // =====================================================
    mapearTarifa(row) {
        if (!row) return null;
        
        const tarifa = {};
        
        // Si es un array (de cursor), usar índices
        if (Array.isArray(row)) {
            // Los cursores devuelven arrays, pero oracledb con OUT_FORMAT_OBJECT devuelve objetos
            return row;
        }
        
        // Si es un objeto directo (cuando OUT_FORMAT_OBJECT), devolver tal cual
        return row;
    }
    
    // =====================================================
    // MAPEAR ESTADÍSTICAS
    // =====================================================
    mapearEstadisticas(row, metaData) {
        const stats = {};
        metaData.forEach((meta, index) => {
            const columnName = meta.name;
            let value = row[index];
            
            // Convertir a número si es necesario
            if (value !== null && !isNaN(value)) {
                value = Number(value);
            }
            
            const camelCaseName = columnName.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            stats[camelCaseName] = value;
        });
        
        return stats;
    }
}

module.exports = new TarifaService();