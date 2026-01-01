const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class CalificacionService {
    
    async obtenerPorId(id) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            const result = await connection.execute(
                `SELECT 
                    c.CALIFICACION_ID,
                    c.RESERVA_ID,
                    c.HUESPED_ID,
                    c.PUNTUACION,
                    c.LIMPIEZA,
                    c.SERVICIO,
                    c.UBICACION,
                    c.RELACION_CALIDAD_PRECIO,
                    c.COMENTARIO,
                    c.RESPUESTA_HOTEL,
                    c.FECHA_RESPUESTA,
                    c.FECHA_CREACION,
                    c.USUARIO_CREACION,
                    c.FECHA_MODIFICACION,
                    c.USUARIO_MODIFICACION,
                    h.NOMBRES || ' ' || h.APELLIDOS as NOMBRE_HUESPED,
                    r.CODIGO_RESERVA,
                    hot.NOMBRE as NOMBRE_HOTEL
                 FROM CALIFICACION c
                 JOIN HUESPED h ON c.HUESPED_ID = h.HUESPED_ID
                 JOIN RESERVA r ON c.RESERVA_ID = r.RESERVA_ID
                 JOIN HOTEL hot ON r.HOTEL_ID = hot.HOTEL_ID
                 WHERE c.CALIFICACION_ID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                await connection.close();
                throw { code: 'NOT_FOUND', message: 'Calificación no encontrada' };
            }
            
            // Formatear ANTES de cerrar (usando versión async para CLOBs)
            const calificacion = await this.formatearObjetoAsync(result.rows[0]);
            
            // Cerrar conexión
            await connection.close();
            connection = null;
            
            // Retornar DESPUÉS de cerrar
            return calificacion;
            
        } catch (error) {
            if (connection) {
                try {
                    await connection.close();
                } catch (e) {}
            }
            
            console.error('Error original en obtenerPorId:', {
                hasCode: !!error.code,
                hasMessage: !!error.message,
                messageType: typeof error.message
            });
            
            // SIEMPRE lanzar un error limpio con strings
            throw { 
                code: error.code || 'INTERNAL_ERROR', 
                message: typeof error.message === 'string' ? error.message : 'Error al obtener calificación'
            };
        }
    }

    async listarPorHotel(hotelId, filtros = {}) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            let sql = `SELECT 
                c.CALIFICACION_ID,
                c.RESERVA_ID,
                c.HUESPED_ID,
                c.PUNTUACION,
                c.LIMPIEZA,
                c.SERVICIO,
                c.UBICACION,
                c.RELACION_CALIDAD_PRECIO,
                c.COMENTARIO,
                c.RESPUESTA_HOTEL,
                c.FECHA_RESPUESTA,
                c.FECHA_CREACION,
                c.USUARIO_CREACION,
                c.FECHA_MODIFICACION,
                c.USUARIO_MODIFICACION,
                h.NOMBRES || ' ' || h.APELLIDOS as NOMBRE_HUESPED,
                r.CODIGO_RESERVA,
                hot.NOMBRE as NOMBRE_HOTEL
            FROM CALIFICACION c
            JOIN HUESPED h ON c.HUESPED_ID = h.HUESPED_ID
            JOIN RESERVA r ON c.RESERVA_ID = r.RESERVA_ID
            JOIN HOTEL hot ON r.HOTEL_ID = hot.HOTEL_ID
            WHERE r.HOTEL_ID = :hotel_id`;
            
            const binds = { hotel_id: hotelId };
            
            if (filtros.puntuacion_minima) {
                sql += ` AND c.PUNTUACION >= :puntuacion_minima`;
                binds.puntuacion_minima = filtros.puntuacion_minima;
            }
            
            sql += ` ORDER BY c.FECHA_CREACION DESC`;
            
            const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
            
            console.log('Cantidad de filas:', result.rows.length);
            
            // Formatear ANTES de cerrar - con validación adicional
            const calificaciones = [];
            for (const row of result.rows) {
                try {
                    const formatted = await this.formatearObjetoAsync(row);
                    if (formatted) {
                        calificaciones.push(formatted);
                    }
                } catch (formatError) {
                    console.error('Error formateando fila:', formatError);
                }
            }
            
            // Cerrar conexión
            await connection.close();
            connection = null;
            
            // Retornar DESPUÉS de cerrar
            return calificaciones;
            
        } catch (error) {
            if (connection) {
                try {
                    await connection.close();
                } catch (e) {}
            }
            
            console.error('Error original en listarPorHotel:', {
                hasCode: !!error.code,
                hasMessage: !!error.message,
                messageType: typeof error.message,
                errorNum: error.errorNum
            });
            
            // SIEMPRE lanzar un error limpio con strings
            throw { 
                code: error.code || 'INTERNAL_ERROR', 
                message: typeof error.message === 'string' ? error.message : 'Error al listar calificaciones'
            };
        }
    }

    async responder(id, respuestaHotel, usuario) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            await connection.execute(
                `BEGIN PKG_CALIFICACION.sp_responder_calificacion(
                    :id, :respuesta_hotel, :usuario); END;`,
                {
                    id: id,
                    respuesta_hotel: respuestaHotel,
                    usuario: usuario
                },
                { autoCommit: true }
            );
            
            const result = await connection.execute(
                `SELECT 
                    c.*,
                    h.NOMBRES || ' ' || h.APELLIDOS as NOMBRE_HUESPED,
                    r.CODIGO_RESERVA,
                    hot.NOMBRE as NOMBRE_HOTEL
                 FROM CALIFICACION c
                 JOIN HUESPED h ON c.HUESPED_ID = h.HUESPED_ID
                 JOIN RESERVA r ON c.RESERVA_ID = r.RESERVA_ID
                 JOIN HOTEL hot ON r.HOTEL_ID = hot.HOTEL_ID
                 WHERE c.CALIFICACION_ID = :id`,
                { id },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                throw { code: 'NOT_FOUND', message: 'Calificación no encontrada' };
            }
            
            return this.formatearObjeto(result.rows[0]);
            
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error cerrando conexión:', closeError);
                }
            }
        }
    }

    async eliminar(id) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            await connection.execute(
                `BEGIN PKG_CALIFICACION.sp_eliminar_calificacion(:id); END;`,
                { id },
                { autoCommit: true }
            );
            
            return { success: true, message: 'Calificación eliminada' };
            
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error cerrando conexión:', closeError);
                }
            }
        }
    }

    async obtenerEstadisticasHotel(hotelId) {
        let connection;
        try {
            connection = await dbConfig.getConnection();
            
            const result = await connection.execute(
                `SELECT 
                    PKG_CALIFICACION.fn_calcular_promedio_hotel(:hotel_id) as PROMEDIO_GENERAL,
                    PKG_CALIFICACION.fn_obtener_total_calificaciones(:hotel_id) as TOTAL_CALIFICACIONES,
                    PKG_CALIFICACION.fn_calcular_promedio_categoria(:hotel_id, 'LIMPIEZA') as PROMEDIO_LIMPIEZA,
                    PKG_CALIFICACION.fn_calcular_promedio_categoria(:hotel_id, 'SERVICIO') as PROMEDIO_SERVICIO,
                    PKG_CALIFICACION.fn_calcular_promedio_categoria(:hotel_id, 'UBICACION') as PROMEDIO_UBICACION,
                    PKG_CALIFICACION.fn_calcular_promedio_categoria(:hotel_id, 'CALIDAD_PRECIO') as PROMEDIO_CALIDAD_PRECIO
                 FROM DUAL`,
                { hotel_id: hotelId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            const distribucion = await connection.execute(
                `SELECT 
                    PUNTUACION,
                    COUNT(*) as CANTIDAD
                 FROM CALIFICACION c
                 JOIN RESERVA r ON c.RESERVA_ID = r.RESERVA_ID
                 WHERE r.HOTEL_ID = :hotel_id
                 AND c.PUNTUACION IS NOT NULL
                 GROUP BY PUNTUACION
                 ORDER BY PUNTUACION DESC`,
                { hotel_id: hotelId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            return {
                hotel_id: Number(hotelId),
                promedio_general: Number(result.rows[0].PROMEDIO_GENERAL || 0),
                total_calificaciones: Number(result.rows[0].TOTAL_CALIFICACIONES || 0),
                promedios_por_categoria: {
                    limpieza: Number(result.rows[0].PROMEDIO_LIMPIEZA || 0),
                    servicio: Number(result.rows[0].PROMEDIO_SERVICIO || 0),
                    ubicacion: Number(result.rows[0].PROMEDIO_UBICACION || 0),
                    relacion_calidad_precio: Number(result.rows[0].PROMEDIO_CALIDAD_PRECIO || 0)
                },
                distribucion_puntuaciones: distribucion.rows.map(row => ({
                    puntuacion: Number(row.PUNTUACION),
                    cantidad: Number(row.CANTIDAD)
                }))
            };
            
        } catch (error) {
            throw this.manejarError(error);
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    console.error('Error cerrando conexión:', closeError);
                }
            }
        }
    }

    formatearObjeto(row) {
        // Validar que row existe
        if (!row) {
            return null;
        }
        
        // Convertir cada campo de forma segura a tipos primitivos
        return {
            calificacion_id: row.CALIFICACION_ID ? Number(row.CALIFICACION_ID) : null,
            reserva_id: row.RESERVA_ID ? Number(row.RESERVA_ID) : null,
            huesped_id: row.HUESPED_ID ? Number(row.HUESPED_ID) : null,
            puntuacion: row.PUNTUACION ? Number(row.PUNTUACION) : null,
            limpieza: row.LIMPIEZA ? Number(row.LIMPIEZA) : null,
            servicio: row.SERVICIO ? Number(row.SERVICIO) : null,
            ubicacion: row.UBICACION ? Number(row.UBICACION) : null,
            relacion_calidad_precio: row.RELACION_CALIDAD_PRECIO ? Number(row.RELACION_CALIDAD_PRECIO) : null,
            comentario: row.COMENTARIO ? String(row.COMENTARIO) : null,
            respuesta_hotel: row.RESPUESTA_HOTEL ? String(row.RESPUESTA_HOTEL) : null,
            fecha_respuesta: row.FECHA_RESPUESTA || null,
            nombre_huesped: row.NOMBRE_HUESPED ? String(row.NOMBRE_HUESPED) : null,
            codigo_reserva: row.CODIGO_RESERVA ? String(row.CODIGO_RESERVA) : null,
            nombre_hotel: row.NOMBRE_HOTEL ? String(row.NOMBRE_HOTEL) : null,
            fecha_creacion: row.FECHA_CREACION || null,
            usuario_creacion: row.USUARIO_CREACION ? String(row.USUARIO_CREACION) : null,
            fecha_modificacion: row.FECHA_MODIFICACION || null,
            usuario_modificacion: row.USUARIO_MODIFICACION ? String(row.USUARIO_MODIFICACION) : null
        };
    }

    async formatearObjetoAsync(row) {
        // Validar que row existe
        if (!row) {
            return null;
        }
        
        // Función helper para leer CLOB
        const leerClob = async (clob) => {
            if (!clob) return null;
            if (typeof clob === 'string') return clob;
            
            // Si es un objeto Lob, leerlo
            if (clob.constructor && clob.constructor.name === 'Lob') {
                return new Promise((resolve, reject) => {
                    let texto = '';
                    clob.setEncoding('utf8');
                    clob.on('data', chunk => { texto += chunk; });
                    clob.on('end', () => resolve(texto));
                    clob.on('error', reject);
                });
            }
            
            return String(clob);
        };
        
        // Leer campos CLOB de forma asíncrona
        const comentario = await leerClob(row.COMENTARIO);
        const respuesta_hotel = await leerClob(row.RESPUESTA_HOTEL);
        
        // Convertir cada campo de forma segura a tipos primitivos
        return {
            calificacion_id: row.CALIFICACION_ID ? Number(row.CALIFICACION_ID) : null,
            reserva_id: row.RESERVA_ID ? Number(row.RESERVA_ID) : null,
            huesped_id: row.HUESPED_ID ? Number(row.HUESPED_ID) : null,
            puntuacion: row.PUNTUACION ? Number(row.PUNTUACION) : null,
            limpieza: row.LIMPIEZA ? Number(row.LIMPIEZA) : null,
            servicio: row.SERVICIO ? Number(row.SERVICIO) : null,
            ubicacion: row.UBICACION ? Number(row.UBICACION) : null,
            relacion_calidad_precio: row.RELACION_CALIDAD_PRECIO ? Number(row.RELACION_CALIDAD_PRECIO) : null,
            comentario: comentario,
            respuesta_hotel: respuesta_hotel,
            fecha_respuesta: row.FECHA_RESPUESTA || null,
            nombre_huesped: row.NOMBRE_HUESPED ? String(row.NOMBRE_HUESPED) : null,
            codigo_reserva: row.CODIGO_RESERVA ? String(row.CODIGO_RESERVA) : null,
            nombre_hotel: row.NOMBRE_HOTEL ? String(row.NOMBRE_HOTEL) : null,
            fecha_creacion: row.FECHA_CREACION || null,
            usuario_creacion: row.USUARIO_CREACION ? String(row.USUARIO_CREACION) : null,
            fecha_modificacion: row.FECHA_MODIFICACION || null,
            usuario_modificacion: row.USUARIO_MODIFICACION ? String(row.USUARIO_MODIFICACION) : null
        };
    }

    manejarError(error) {
        // Log del error original para debugging
        console.error('Error original:', error);
        
        // Si es un error de Oracle con errorNum
        if (error.errorNum) {
            const errorMap = {
                20001: { code: 'NOT_FOUND', message: 'Reserva no encontrada' },
                20002: { code: 'UNAUTHORIZED', message: 'El huésped no pertenece a esta reserva' },
                20003: { code: 'VALIDATION_ERROR', message: 'Solo se pueden calificar reservas completadas' },
                20004: { code: 'DUPLICATE', message: 'Esta reserva ya tiene una calificación' },
                20005: { code: 'VALIDATION_ERROR', message: 'Las puntuaciones deben estar entre 1 y 5' },
                20006: { code: 'NOT_FOUND', message: 'Calificación no encontrada' },
                20007: { code: 'VALIDATION_ERROR', message: 'La respuesta no puede estar vacía' }
            };
            
            const mappedError = errorMap[Math.abs(error.errorNum)];
            if (mappedError) {
                return mappedError;
            }
            
            // Error de Oracle no mapeado - extraer solo el mensaje
            return { 
                code: 'DATABASE_ERROR', 
                message: typeof error.message === 'string' ? error.message : `Error ${error.errorNum}`
            };
        }
        
        // Si ya tiene code y message como strings
        if (error.code && typeof error.message === 'string') {
            return error;
        }
        
        // Último recurso: extraer cualquier información útil
        return { 
            code: 'INTERNAL_ERROR', 
            message: typeof error === 'string' ? error : 'Error interno del servidor'
        };
    }
}

module.exports = new CalificacionService();