const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class MembresiaService {
    
    async crear(datos, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `BEGIN PKG_MEMBRESIA.sp_crear_membresia(
                    :nombre, :nivel, :descuento_porcentaje, 
                    :puntos_por_dolar, :beneficios, :puntos_minimos,
                    :usuario, :id); END;`,
                {
                    nombre: datos.nombre,
                    nivel: datos.nivel,
                    descuento_porcentaje: datos.descuento_porcentaje || 0,
                    puntos_por_dolar: datos.puntos_por_dolar || 0,
                    beneficios: datos.beneficios || null,
                    puntos_minimos: datos.puntos_minimos || 0,
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
                `SELECT * FROM MEMBRESIA WHERE MEMBRESIA_ID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                throw { code: 'NOT_FOUND', message: 'Membresía no encontrada' };
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
                    m.*,
                    (SELECT COUNT(*) FROM HUESPED WHERE MEMBRESIA_ID = m.MEMBRESIA_ID) as HUESPEDES_ASOCIADOS
                 FROM MEMBRESIA m
                 ORDER BY m.NIVEL ASC`,
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
                `BEGIN PKG_MEMBRESIA.sp_actualizar_membresia(
                    :id, :nombre, :nivel, :descuento_porcentaje,
                    :puntos_por_dolar, :beneficios, :puntos_minimos, :usuario); END;`,
                {
                    id: id,
                    nombre: datos.nombre || null,
                    nivel: datos.nivel || null,
                    descuento_porcentaje: datos.descuento_porcentaje || null,
                    puntos_por_dolar: datos.puntos_por_dolar || null,
                    beneficios: datos.beneficios || null,
                    puntos_minimos: datos.puntos_minimos || null,
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
                `BEGIN PKG_MEMBRESIA.sp_eliminar_membresia(:id); END;`,
                { id },
                { autoCommit: true }
            );
            
            return { success: true, message: 'Membresía eliminada' };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async calcularDescuento(membresiaId, montoTotal) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT PKG_MEMBRESIA.fn_calcular_descuento(:membresia_id, :monto_total) AS descuento FROM DUAL`,
                { membresia_id: membresiaId, monto_total: montoTotal },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            return {
                membresia_id: membresiaId,
                monto_total: montoTotal,
                descuento: result.rows[0].DESCUENTO,
                monto_final: montoTotal - result.rows[0].DESCUENTO
            };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async calcularPuntosGanados(membresiaId, montoGastado) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT PKG_MEMBRESIA.fn_calcular_puntos_ganados(:membresia_id, :monto_gastado) AS puntos FROM DUAL`,
                { membresia_id: membresiaId, monto_gastado: montoGastado },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            return {
                membresia_id: membresiaId,
                monto_gastado: montoGastado,
                puntos_ganados: result.rows[0].PUNTOS
            };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async obtenerMembresiaPorPuntos(puntosAcumulados) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT PKG_MEMBRESIA.fn_obtener_membresia_por_puntos(:puntos) AS membresia_id FROM DUAL`,
                { puntos: puntosAcumulados },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            const membresiaId = result.rows[0].MEMBRESIA_ID;
            const membresia = await this.obtenerPorId(membresiaId);
            
            return {
                puntos_acumulados: puntosAcumulados,
                membresia_recomendada: membresia
            };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    async verificarNombreDisponible(nombre, membresiaId = null) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT PKG_MEMBRESIA.fn_verificar_nombre_disponible(:nombre, :membresia_id) AS disponible FROM DUAL`,
                { nombre, membresia_id: membresiaId },
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

    async verificarNivelDisponible(nivel, membresiaId = null) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT PKG_MEMBRESIA.fn_verificar_nivel_disponible(:nivel, :membresia_id) AS disponible FROM DUAL`,
                { nivel, membresia_id: membresiaId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            return {
                nivel: nivel,
                disponible: result.rows[0].DISPONIBLE === 'SI'
            };
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) await connection.close();
        }
    }

    formatearObjeto(row) {
        return {
            membresia_id: row.MEMBRESIA_ID,
            nombre: row.NOMBRE,
            nivel: row.NIVEL,
            descuento_porcentaje: row.DESCUENTO_PORCENTAJE,
            puntos_por_dolar: row.PUNTOS_POR_DOLAR,
            beneficios: row.BENEFICIOS,
            puntos_minimos: row.PUNTOS_MINIMOS,
            huespedes_asociados: row.HUESPEDES_ASOCIADOS || 0,
            fecha_creacion: row.FECHA_CREACION,
            usuario_creacion: row.USUARIO_CREACION,
            fecha_modificacion: row.FECHA_MODIFICACION,
            usuario_modificacion: row.USUARIO_MODIFICACION
        };
    }

    manejarError(error) {
        if (error.errorNum) {
            const errorMap = {
                20001: { code: 'VALIDATION_ERROR', message: 'El nombre es requerido' },
                20002: { code: 'VALIDATION_ERROR', message: 'El nivel debe ser mayor a 0' },
                20003: { code: 'VALIDATION_ERROR', message: 'El descuento debe estar entre 0 y 100' },
                20004: { code: 'VALIDATION_ERROR', message: 'Los puntos por dólar no pueden ser negativos' },
                20005: { code: 'DUPLICATE_NAME', message: 'Ya existe una membresía con ese nombre' },
                20006: { code: 'DUPLICATE_LEVEL', message: 'Ya existe una membresía con ese nivel' },
                20007: { code: 'NOT_FOUND', message: 'Membresía no encontrada' },
                20008: { code: 'IN_USE', message: 'No se puede eliminar: hay huéspedes asociados' }
            };
            return errorMap[Math.abs(error.errorNum)] || { code: 'DATABASE_ERROR', message: error.message };
        }
        return error.code ? error : { code: 'INTERNAL_ERROR', message: error.message };
    }
}

module.exports = new MembresiaService();