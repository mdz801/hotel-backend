const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class ReservaServicioService {
    
    async agregarServicio(datos, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            // Convertir fecha a objeto Date si viene como string
            let fechaServicio = null;
            if (datos.fecha_servicio) {
                fechaServicio = new Date(datos.fecha_servicio);
            }
            
            const result = await connection.execute(
                `BEGIN PKG_RESERVA_SERVICIO.sp_agregar_servicio(
                    :reserva_id, :servicio_id, :cantidad, :fecha_servicio, :usuario, :id); END;`,
                {
                    reserva_id: datos.reserva_id,
                    servicio_id: datos.servicio_id,
                    cantidad: datos.cantidad || 1,
                    fecha_servicio: fechaServicio,
                    usuario: usuario,
                    id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                { autoCommit: true }
            );
            return await this.obtenerPorId(result.outBinds.id);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async obtenerPorId(id) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `SELECT rs.*, s.NOMBRE as servicio_nombre, s.CATEGORIA
                 FROM RESERVA_SERVICIO rs
                 INNER JOIN SERVICIO_ADICIONAL s ON rs.SERVICIO_ID = s.SERVICIO_ID
                 WHERE rs.RESERVA_SERVICIO_ID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                throw { code: 'NOT_FOUND', message: 'Servicio no encontrado' };
            }
            
            return this.formatearObjeto(result.rows[0]);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async listarPorReserva(reservaId) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `SELECT rs.*, s.NOMBRE as servicio_nombre, s.CATEGORIA
                 FROM RESERVA_SERVICIO rs
                 INNER JOIN SERVICIO_ADICIONAL s ON rs.SERVICIO_ID = s.SERVICIO_ID
                 WHERE rs.RESERVA_ID = :reserva_id
                 ORDER BY rs.FECHA_CREACION DESC`,
                { reserva_id: reservaId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return result.rows.map(row => this.formatearObjeto(row));
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async actualizarEstado(id, estado, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            await connection.execute(
                `BEGIN PKG_RESERVA_SERVICIO.sp_actualizar_estado(:id, :estado, :usuario); END;`,
                { id, estado, usuario },
                { autoCommit: true }
            );
            return await this.obtenerPorId(id);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async actualizarCantidad(id, cantidad, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            await connection.execute(
                `BEGIN PKG_RESERVA_SERVICIO.sp_actualizar_cantidad(:id, :cantidad, :usuario); END;`,
                { id, cantidad, usuario },
                { autoCommit: true }
            );
            return await this.obtenerPorId(id);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async cancelarServicio(id, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            await connection.execute(
                `BEGIN PKG_RESERVA_SERVICIO.sp_cancelar_servicio(:id, :usuario); END;`,
                { id, usuario },
                { autoCommit: true }
            );
            return { success: true, message: 'Servicio cancelado' };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async calcularTotalReserva(reservaId) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `SELECT PKG_RESERVA_SERVICIO.fn_calcular_total_reserva(:reserva_id) AS total FROM DUAL`,
                { reserva_id: reservaId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return { reserva_id: reservaId, total_servicios: result.rows[0].TOTAL };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async obtenerEstadisticas(reservaId) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `SELECT 
                    s.CATEGORIA,
                    COUNT(*) as total_servicios,
                    SUM(rs.SUBTOTAL) as total_monto
                 FROM RESERVA_SERVICIO rs
                 INNER JOIN SERVICIO_ADICIONAL s ON rs.SERVICIO_ID = s.SERVICIO_ID
                 WHERE rs.RESERVA_ID = :reserva_id
                   AND rs.ESTADO != 'CANCELADO'
                 GROUP BY s.CATEGORIA
                 ORDER BY total_monto DESC`,
                { reserva_id: reservaId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return result.rows.map(row => ({
                categoria: row.CATEGORIA,
                total_servicios: row.TOTAL_SERVICIOS,
                total_monto: row.TOTAL_MONTO
            }));
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    formatearObjeto(row) {
        return {
            reserva_servicio_id: row.RESERVA_SERVICIO_ID,
            reserva_id: row.RESERVA_ID,
            servicio_id: row.SERVICIO_ID,
            servicio_nombre: row.SERVICIO_NOMBRE,
            categoria: row.CATEGORIA,
            cantidad: row.CANTIDAD,
            precio_unitario: row.PRECIO_UNITARIO,
            subtotal: row.SUBTOTAL,
            fecha_servicio: row.FECHA_SERVICIO,
            estado: row.ESTADO,
            fecha_creacion: row.FECHA_CREACION,
            usuario_creacion: row.USUARIO_CREACION,
            fecha_modificacion: row.FECHA_MODIFICACION,
            usuario_modificacion: row.USUARIO_MODIFICACION
        };
    }

    manejarError(error) {
        if (error.errorNum) {
            const errorMap = {
                20001: { code: 'VALIDATION_ERROR', message: 'Datos inválidos' },
                20002: { code: 'NOT_FOUND', message: 'Reserva no encontrada' },
                20003: { code: 'NOT_FOUND', message: 'Servicio no encontrado' },
                20004: { code: 'INVALID_STATE', message: 'Estado de reserva inválido' },
                20005: { code: 'NOT_FOUND', message: 'Servicio de reserva no encontrado' },
                20006: { code: 'INVALID_STATE', message: 'Estado inválido' },
                20007: { code: 'VALIDATION_ERROR', message: 'Cantidad inválida' }
            };
            return errorMap[Math.abs(error.errorNum)] || { code: 'DATABASE_ERROR', message: error.message };
        }
        return error.code ? error : { code: 'INTERNAL_ERROR', message: error.message };
    }
}

module.exports = new ReservaServicioService();