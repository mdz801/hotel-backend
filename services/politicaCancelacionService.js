const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class PoliticaCancelacionService {
    
    async crear(datos, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `BEGIN PKG_POLITICA_CANCELACION.sp_crear_politica(
                    :nombre, :descripcion, :dias_antes_checkin, 
                    :porcentaje_penalidad, :permite_reembolso, 
                    :usuario, :id); END;`,
                {
                    nombre: datos.nombre,
                    descripcion: datos.descripcion || null,
                    dias_antes_checkin: datos.dias_antes_checkin,
                    porcentaje_penalidad: datos.porcentaje_penalidad,
                    permite_reembolso: datos.permite_reembolso || 'S',
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
                `SELECT * FROM POLITICA_CANCELACION WHERE POLITICA_ID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                throw { code: 'NOT_FOUND', message: 'Política de cancelación no encontrada' };
            }
            
            return this.formatearObjeto(result.rows[0]);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async listar() {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `SELECT 
                    pc.*,
                    (SELECT COUNT(*) FROM RESERVA WHERE POLITICA_CANCELACION_ID = pc.POLITICA_ID) as RESERVAS_ASOCIADAS
                 FROM POLITICA_CANCELACION pc
                 ORDER BY pc.DIAS_ANTES_CHECKIN, pc.PORCENTAJE_PENALIDAD`,
                {},
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            return result.rows.map(row => this.formatearObjeto(row));
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async actualizar(id, datos, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            await connection.execute(
                `BEGIN PKG_POLITICA_CANCELACION.sp_actualizar_politica(
                    :id, :nombre, :descripcion, :dias_antes_checkin,
                    :porcentaje_penalidad, :permite_reembolso, :usuario); END;`,
                {
                    id: id,
                    nombre: datos.nombre || null,
                    descripcion: datos.descripcion || null,
                    dias_antes_checkin: datos.dias_antes_checkin || null,
                    porcentaje_penalidad: datos.porcentaje_penalidad || null,
                    permite_reembolso: datos.permite_reembolso || null,
                    usuario: usuario
                },
                { autoCommit: true }
            );
            
            return await this.obtenerPorId(id);
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async eliminar(id) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            await connection.execute(
                `BEGIN PKG_POLITICA_CANCELACION.sp_eliminar_politica(:id); END;`,
                { id },
                { autoCommit: true }
            );
            
            return { success: true, message: 'Política eliminada' };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async calcularPenalidad(politicaId, totalReserva, diasRestantes) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT PKG_POLITICA_CANCELACION.fn_calcular_penalidad(
                    :politica_id, :total_reserva, :dias_restantes) AS penalidad FROM DUAL`,
                { 
                    politica_id: politicaId, 
                    total_reserva: totalReserva, 
                    dias_restantes: diasRestantes 
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            return {
                politica_id: politicaId,
                total_reserva: totalReserva,
                dias_restantes: diasRestantes,
                penalidad: result.rows[0].PENALIDAD,
                monto_reembolso: totalReserva - result.rows[0].PENALIDAD
            };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async puedeCancelar(politicaId, diasRestantes) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT PKG_POLITICA_CANCELACION.fn_puede_cancelar(
                    :politica_id, :dias_restantes) AS puede FROM DUAL`,
                { politica_id: politicaId, dias_restantes: diasRestantes },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            const puede = result.rows[0].PUEDE;
            return {
                politica_id: politicaId,
                dias_restantes: diasRestantes,
                puede_cancelar: puede === 'SI' || puede === 'CON_PENALIDAD',
                tipo: puede,
                mensaje: this.getMensajeCancelacion(puede)
            };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async verificarNombreDisponible(nombre, politicaId = null) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT PKG_POLITICA_CANCELACION.fn_verificar_nombre_disponible(
                    :nombre, :politica_id) AS disponible FROM DUAL`,
                { nombre, politica_id: politicaId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            return {
                nombre: nombre,
                disponible: result.rows[0].DISPONIBLE === 'SI'
            };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    getMensajeCancelacion(tipo) {
        const mensajes = {
            'SI': 'Puede cancelar sin penalidad',
            'CON_PENALIDAD': 'Puede cancelar pero se aplicará penalidad',
            'NO': 'No permite cancelación'
        };
        return mensajes[tipo] || 'Estado desconocido';
    }

    formatearObjeto(row) {
        return {
            politica_id: row.POLITICA_ID,
            nombre: row.NOMBRE,
            descripcion: row.DESCRIPCION,
            dias_antes_checkin: row.DIAS_ANTES_CHECKIN,
            porcentaje_penalidad: row.PORCENTAJE_PENALIDAD,
            permite_reembolso: row.PERMITE_REEMBOLSO,
            reservas_asociadas: row.RESERVAS_ASOCIADAS || 0,
            fecha_creacion: row.FECHA_CREACION,
            usuario_creacion: row.USUARIO_CREACION,
            fecha_modificacion: row.FECHA_MODIFICACION,
            usuario_modificacion: row.USUARIO_MODIFICACION
        };
    }

    manejarError(error) {
        if (error.errorNum) {
            const errorMap = {
                20001: { code: 'DUPLICATE_NAME', message: 'Ya existe una política con ese nombre' },
                20002: { code: 'VALIDATION_ERROR', message: 'Los días no pueden ser negativos' },
                20003: { code: 'VALIDATION_ERROR', message: 'El porcentaje debe estar entre 0 y 100' },
                20004: { code: 'VALIDATION_ERROR', message: 'Permite reembolso debe ser S o N' },
                20005: { code: 'NOT_FOUND', message: 'Política no encontrada' },
                20006: { code: 'IN_USE', message: 'No se puede eliminar: está siendo usada en reservas' }
            };
            return errorMap[Math.abs(error.errorNum)] || { code: 'DATABASE_ERROR', message: error.message };
        }
        return error.code ? error : { code: 'INTERNAL_ERROR', message: error.message };
    }
}

module.exports = new PoliticaCancelacionService();