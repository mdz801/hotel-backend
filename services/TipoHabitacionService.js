const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class TipoHabitacionService {
    
    async crearTipoHabitacion(datos, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `BEGIN PKG_TIPO_HABITACION.sp_crear_tipo_habitacion(
                    :nombre, :descripcion, :capacidad_adultos, :capacidad_ninos, :metros_cuadrados, 
                    :tipo_cama, :amenidades, :usuario, :id); END;`,
                {
                    nombre: datos.nombre,
                    descripcion: datos.descripcion || null,
                    capacidad_adultos: datos.capacidad_adultos,
                    capacidad_ninos: datos.capacidad_ninos || 0,
                    metros_cuadrados: datos.metros_cuadrados || null,
                    tipo_cama: datos.tipo_cama || null,
                    amenidades: datos.amenidades || null,
                    usuario: usuario,
                    id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                { autoCommit: true }
            );
            return await this.obtenerTipoPorId(result.outBinds.id);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async obtenerTipoPorId(id) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TIPO_HABITACION.fn_obtener_tipo_por_id(:id); END;`,
                { 
                    id,
                    cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
                }
            );
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(1);
            await resultSet.close();
            
            if (rows.length === 0) throw { code: 'TIPO_NOT_FOUND', message: 'Tipo no encontrado' };
            return this.formatearTipo(rows[0]);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async listarTipos() {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TIPO_HABITACION.fn_listar_tipos(); END;`,
                { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
            );
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(100);
            await resultSet.close();
            return rows.map(row => this.formatearTipo(row));
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async listarTiposActivos() {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TIPO_HABITACION.fn_listar_tipos_activos(); END;`,
                { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
            );
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(100);
            await resultSet.close();
            return rows.map(row => this.formatearTipo(row));
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async actualizarTipoHabitacion(id, datos, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            await connection.execute(
                `BEGIN PKG_TIPO_HABITACION.sp_actualizar_tipo_habitacion(
                    :id, :nombre, :descripcion, :capacidad_adultos, :capacidad_ninos, 
                    :metros_cuadrados, :tipo_cama, :amenidades, :usuario); END;`,
                {
                    id, usuario,
                    nombre: datos.nombre || null,
                    descripcion: datos.descripcion || null,
                    capacidad_adultos: datos.capacidad_adultos || null,
                    capacidad_ninos: datos.capacidad_ninos !== undefined ? datos.capacidad_ninos : null,
                    metros_cuadrados: datos.metros_cuadrados || null,
                    tipo_cama: datos.tipo_cama || null,
                    amenidades: datos.amenidades || null
                },
                { autoCommit: true }
            );
            return await this.obtenerTipoPorId(id);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async eliminarTipoHabitacion(id, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            await connection.execute(
                `BEGIN PKG_TIPO_HABITACION.sp_eliminar_tipo_habitacion(:id, :usuario); END;`,
                { id, usuario },
                { autoCommit: true }
            );
            return { success: true, message: 'Tipo eliminado' };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async buscarPorNombre(nombre) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TIPO_HABITACION.fn_buscar_por_nombre(:nombre); END;`,
                { 
                    nombre,
                    cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
                }
            );
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(100);
            await resultSet.close();
            return rows.map(row => this.formatearTipo(row));
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async obtenerPorCapacidad(capacidadMinima) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TIPO_HABITACION.fn_obtener_por_capacidad(:capacidad); END;`,
                { 
                    capacidad: capacidadMinima,
                    cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
                }
            );
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(100);
            await resultSet.close();
            return rows.map(row => this.formatearTipo(row));
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async verificarNombreDisponible(nombre, tipoHabitacionId = null) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `SELECT PKG_TIPO_HABITACION.fn_verificar_nombre_disponible(:nombre, :id) AS disponible FROM DUAL`,
                { nombre, id: tipoHabitacionId || null },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return { disponible: result.rows[0].DISPONIBLE === 1, nombre };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async obtenerEstadisticas() {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `BEGIN :cursor := PKG_TIPO_HABITACION.fn_obtener_estadisticas(); END;`,
                { cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR } }
            );
            const resultSet = result.outBinds.cursor;
            const rows = await resultSet.getRows(100);
            await resultSet.close();
            return rows.map(row => ({
                tipo_habitacion_id: row[0],
                nombre: row[1],
                capacidad_adultos: row[2],
                capacidad_ninos: row[3],
                total_habitaciones: row[4],
                habitaciones_disponibles: row[5],
                habitaciones_ocupadas: row[6],
                habitaciones_mantenimiento: row[7],
                porcentaje_ocupacion: row[4] > 0 ? ((row[6] / row[4]) * 100).toFixed(2) : 0
            }));
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    formatearTipo(row) {
        return {
            tipo_habitacion_id: row[0],
            nombre: row[1],
            descripcion: row[2],
            capacidad: {
                adultos: row[3],
                ninos: row[4],
                total: row[3] + row[4]
            },
            metros_cuadrados: row[5],
            tipo_cama: row[6],
            amenidades: row[7] ? row[7].split(',').map(a => a.trim()) : [],
            fecha_creacion: row[8],
            usuario_creacion: row[9],
            fecha_modificacion: row[10],
            usuario_modificacion: row[11]
        };
    }

    manejarError(error) {
        if (error.errorNum) {
            const errorMap = {
                20001: { code: 'VALIDATION_ERROR', message: 'Nombre obligatorio' },
                20002: { code: 'VALIDATION_ERROR', message: 'Capacidad adultos debe ser mayor a cero' },
                20003: { code: 'DUPLICATE_NAME', message: 'Nombre ya existe' },
                20004: { code: 'TIPO_NOT_FOUND', message: 'Tipo no encontrado' },
                20005: { code: 'HAS_DEPENDENCIES', message: 'Tiene habitaciones asociadas' }
            };
            return errorMap[Math.abs(error.errorNum)] || { code: 'DATABASE_ERROR', message: error.message };
        }
        return error.code ? error : { code: 'INTERNAL_ERROR', message: error.message };
    }
}

module.exports = new TipoHabitacionService();
