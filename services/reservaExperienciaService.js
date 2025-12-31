const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class ReservaExperienciaService {
    
   async agregarExperiencia(datos, usuario) {
    let connection;
    try {
        connection = await dbConfig.getConnection();
        
        // ✅ VALIDAR FECHA OBLIGATORIA
        if (!datos.fecha_experiencia) {
            throw { 
                code: 'VALIDATION_ERROR', 
                message: 'fecha_experiencia es obligatoria' 
            };
        }
        
        // Separar fecha y hora
        const fecha = new Date(datos.fecha_experiencia);
        const fechaExperiencia = fecha;
        const horaExperiencia = `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}`;
        
        const result = await connection.execute(
            `BEGIN PKG_RESERVA_EXPERIENCIA.sp_agregar_experiencia(
                :reserva_id, :experiencia_id, :numero_personas, 
                :fecha_experiencia, :hora_experiencia, :usuario, :id); END;`,
            {
                reserva_id: datos.reserva_id,
                experiencia_id: datos.experiencia_id,
                numero_personas: datos.numero_personas || 1,
                fecha_experiencia: fechaExperiencia,
                hora_experiencia: horaExperiencia,
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
                `SELECT re.*, e.NOMBRE as experiencia_nombre, e.DURACION_HORAS, e.CAPACIDAD_MAXIMA
                 FROM RESERVA_EXPERIENCIA re
                 INNER JOIN EXPERIENCIA e ON re.EXPERIENCIA_ID = e.EXPERIENCIA_ID
                 WHERE re.RESERVA_EXPERIENCIA_ID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                throw { code: 'NOT_FOUND', message: 'Experiencia no encontrada' };
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
                `SELECT re.*, e.NOMBRE as experiencia_nombre, e.DURACION_HORAS
                 FROM RESERVA_EXPERIENCIA re
                 INNER JOIN EXPERIENCIA e ON re.EXPERIENCIA_ID = e.EXPERIENCIA_ID
                 WHERE re.RESERVA_ID = :reserva_id
                 ORDER BY re.FECHA_EXPERIENCIA NULLS LAST, re.FECHA_CREACION DESC`,
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
                `BEGIN PKG_RESERVA_EXPERIENCIA.sp_cambiar_estado(:id, :estado, :usuario); END;`,
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

    async actualizarCantidad(id, numeroPersonas, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            await connection.execute(
                `BEGIN PKG_RESERVA_EXPERIENCIA.sp_actualizar_experiencia(
                    :id, :numero_personas, NULL, NULL, :usuario); END;`,
                { id, numero_personas: numeroPersonas, usuario },
                { autoCommit: true }
            );
            return await this.obtenerPorId(id);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async cancelarExperiencia(id, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            await connection.execute(
                `BEGIN PKG_RESERVA_EXPERIENCIA.sp_cancelar_experiencia(:id, :usuario); END;`,
                { id, usuario },
                { autoCommit: true }
            );
            return { success: true, message: 'Experiencia cancelada' };
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
                `SELECT PKG_RESERVA_EXPERIENCIA.fn_calcular_total_experiencias(:reserva_id) AS total FROM DUAL`,
                { reserva_id: reservaId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            return { reserva_id: reservaId, total_experiencias: result.rows[0].TOTAL };
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
                    COUNT(*) as total_experiencias,
                    SUM(re.NUMERO_PERSONAS) as total_personas,
                    SUM(re.PRECIO_TOTAL) as total_monto,
                    AVG(re.PRECIO_TOTAL) as promedio_monto
                 FROM RESERVA_EXPERIENCIA re
                 WHERE re.RESERVA_ID = :reserva_id
                   AND re.ESTADO != 'CANCELADA'`,
                { reserva_id: reservaId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                return {
                    total_experiencias: 0,
                    total_personas: 0,
                    total_monto: 0,
                    promedio_monto: 0
                };
            }
            
            return {
                total_experiencias: result.rows[0].TOTAL_EXPERIENCIAS,
                total_personas: result.rows[0].TOTAL_PERSONAS,
                total_monto: result.rows[0].TOTAL_MONTO,
                promedio_monto: result.rows[0].PROMEDIO_MONTO
            };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    formatearObjeto(row) {
        return {
            reserva_experiencia_id: row.RESERVA_EXPERIENCIA_ID,
            reserva_id: row.RESERVA_ID,
            experiencia_id: row.EXPERIENCIA_ID,
            experiencia_nombre: row.EXPERIENCIA_NOMBRE,
            duracion_horas: row.DURACION_HORAS,
            capacidad_maxima: row.CAPACIDAD_MAXIMA,
            numero_personas: row.NUMERO_PERSONAS,
            precio_total: row.PRECIO_TOTAL,
            fecha_experiencia: row.FECHA_EXPERIENCIA,
            hora_experiencia: row.HORA_EXPERIENCIA,
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
                20001: { code: 'NOT_FOUND', message: 'Reserva no encontrada' },
                20002: { code: 'NOT_FOUND', message: 'Experiencia no encontrada o inactiva' },
                20003: { code: 'VALIDATION_ERROR', message: 'Número de personas inválido' },
                20004: { code: 'VALIDATION_ERROR', message: 'Excede capacidad máxima' },
                20006: { code: 'INVALID_STATE', message: 'Solo se pueden modificar experiencias PENDIENTES' },
                20007: { code: 'NOT_FOUND', message: 'Experiencia no encontrada' },
                20008: { code: 'INVALID_STATE', message: 'Estado inválido' }
            };
            return errorMap[Math.abs(error.errorNum)] || { code: 'DATABASE_ERROR', message: error.message };
        }
        return error.code ? error : { code: 'INTERNAL_ERROR', message: error.message };
    }
}

module.exports = new ReservaExperienciaService();