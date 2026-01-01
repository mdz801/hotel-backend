// services/temporadaService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class TemporadaService {
  
  async crear(datos, usuario) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `BEGIN PKG_TEMPORADA.sp_crear_temporada(
          :hotel_id, :nombre, :fecha_inicio, :fecha_fin,
          :multiplicador_precio, :descripcion, :usuario, :temporada_id); END;`,
        {
          hotel_id: datos.hotel_id,
          nombre: datos.nombre,
          fecha_inicio: new Date(datos.fecha_inicio),
          fecha_fin: new Date(datos.fecha_fin),
          multiplicador_precio: datos.multiplicador_precio || 1.0,
          descripcion: datos.descripcion || null,
          usuario: usuario,
          temporada_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );

      return await this.obtenerPorId(result.outBinds.temporada_id);
      
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
        `SELECT 
          t.TEMPORADA_ID,
          t.HOTEL_ID,
          h.NOMBRE as NOMBRE_HOTEL,
          t.NOMBRE,
          t.FECHA_INICIO,
          t.FECHA_FIN,
          t.MULTIPLICADOR_PRECIO,
          t.DESCRIPCION,
          CASE 
            WHEN SYSDATE BETWEEN t.FECHA_INICIO AND t.FECHA_FIN THEN 'VIGENTE'
            WHEN SYSDATE < t.FECHA_INICIO THEN 'FUTURA'
            ELSE 'PASADA'
          END as ESTADO_VIGENCIA,
          t.FECHA_CREACION,
          t.USUARIO_CREACION,
          t.FECHA_MODIFICACION,
          t.USUARIO_MODIFICACION
        FROM TEMPORADA t
        INNER JOIN HOTEL h ON t.HOTEL_ID = h.HOTEL_ID
        WHERE t.TEMPORADA_ID = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        throw { code: 'NOT_FOUND', message: 'Temporada no encontrada' };
      }

      return this.formatearObjeto(result.rows[0]);
      
    } catch (error) {
      throw this.manejarError(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  async listar(filtros = {}) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      let sql = `SELECT 
        t.TEMPORADA_ID,
        t.HOTEL_ID,
        h.NOMBRE as NOMBRE_HOTEL,
        t.NOMBRE,
        t.FECHA_INICIO,
        t.FECHA_FIN,
        t.MULTIPLICADOR_PRECIO,
        t.DESCRIPCION,
        CASE 
          WHEN SYSDATE BETWEEN t.FECHA_INICIO AND t.FECHA_FIN THEN 'VIGENTE'
          WHEN SYSDATE < t.FECHA_INICIO THEN 'FUTURA'
          ELSE 'PASADA'
        END as ESTADO_VIGENCIA,
        t.FECHA_CREACION
      FROM TEMPORADA t
      INNER JOIN HOTEL h ON t.HOTEL_ID = h.HOTEL_ID`;

      const binds = {};

      if (filtros.hotel_id) {
        sql += ` WHERE t.HOTEL_ID = :hotel_id`;
        binds.hotel_id = filtros.hotel_id;
      }

      sql += ` ORDER BY t.FECHA_INICIO DESC`;

      const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });

      return result.rows.map(row => this.formatearObjeto(row));
      
    } catch (error) {
      throw this.manejarError(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  async obtenerTemporadaVigente(hotelId, fecha) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          t.TEMPORADA_ID,
          t.NOMBRE,
          t.FECHA_INICIO,
          t.FECHA_FIN,
          t.MULTIPLICADOR_PRECIO,
          t.DESCRIPCION
        FROM TEMPORADA t
        WHERE t.HOTEL_ID = :hotel_id
          AND TO_DATE(:fecha, 'YYYY-MM-DD') BETWEEN t.FECHA_INICIO AND t.FECHA_FIN
        ORDER BY t.FECHA_CREACION DESC
        FETCH FIRST 1 ROW ONLY`,
        { hotel_id: hotelId, fecha: fecha },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        temporada_id: row.TEMPORADA_ID,
        nombre: row.NOMBRE,
        fecha_inicio: row.FECHA_INICIO,
        fecha_fin: row.FECHA_FIN,
        multiplicador_precio: row.MULTIPLICADOR_PRECIO,
        descripcion: row.DESCRIPCION
      };
      
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
        `BEGIN PKG_TEMPORADA.sp_actualizar_temporada(
          :id, :nombre, :fecha_inicio, :fecha_fin,
          :multiplicador_precio, :descripcion, :usuario); END;`,
        {
          id: id,
          nombre: datos.nombre || null,
          fecha_inicio: datos.fecha_inicio ? new Date(datos.fecha_inicio) : null,
          fecha_fin: datos.fecha_fin ? new Date(datos.fecha_fin) : null,
          multiplicador_precio: datos.multiplicador_precio || null,
          descripcion: datos.descripcion || null,
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
        `BEGIN PKG_TEMPORADA.sp_eliminar_temporada(:id); END;`,
        { id },
        { autoCommit: true }
      );

      return { success: true, message: 'Temporada eliminada' };
      
    } catch (error) {
      throw this.manejarError(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  async validarSolapamiento(hotelId, fechaInicio, fechaFin, temporadaId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT PKG_TEMPORADA.fn_validar_solapamiento(
          :hotel_id, TO_DATE(:fecha_inicio, 'YYYY-MM-DD'), 
          TO_DATE(:fecha_fin, 'YYYY-MM-DD'), :temporada_id) AS solapa FROM DUAL`,
        { 
          hotel_id: hotelId, 
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          temporada_id: temporadaId 
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return {
        hotel_id: hotelId,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        hay_solapamiento: result.rows[0].SOLAPA === 'SI'
      };
      
    } catch (error) {
      throw this.manejarError(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  async calcularPrecioConTemporada(hotelId, precioBase, fecha) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT PKG_TEMPORADA.fn_calcular_precio_con_temporada(
          :hotel_id, :precio_base, TO_DATE(:fecha, 'YYYY-MM-DD')) AS precio FROM DUAL`,
        { hotel_id: hotelId, precio_base: precioBase, fecha: fecha },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return {
        hotel_id: hotelId,
        precio_base: precioBase,
        fecha: fecha,
        precio_con_temporada: result.rows[0].PRECIO
      };
      
    } catch (error) {
      throw this.manejarError(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  async obtenerEstadisticas(hotelId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          COUNT(*) as TOTAL_TEMPORADAS,
          SUM(CASE WHEN SYSDATE BETWEEN FECHA_INICIO AND FECHA_FIN THEN 1 ELSE 0 END) as VIGENTES,
          SUM(CASE WHEN SYSDATE < FECHA_INICIO THEN 1 ELSE 0 END) as FUTURAS,
          SUM(CASE WHEN SYSDATE > FECHA_FIN THEN 1 ELSE 0 END) as PASADAS,
          AVG(MULTIPLICADOR_PRECIO) as MULTIPLICADOR_PROMEDIO,
          MAX(MULTIPLICADOR_PRECIO) as MULTIPLICADOR_MAXIMO,
          MIN(MULTIPLICADOR_PRECIO) as MULTIPLICADOR_MINIMO
        FROM TEMPORADA
        WHERE (:hotel_id IS NULL OR HOTEL_ID = :hotel_id)`,
        { hotel_id: hotelId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const row = result.rows[0];
      return {
        hotel_id: hotelId,
        total_temporadas: row.TOTAL_TEMPORADAS || 0,
        vigentes: row.VIGENTES || 0,
        futuras: row.FUTURAS || 0,
        pasadas: row.PASADAS || 0,
        multiplicador_promedio: row.MULTIPLICADOR_PROMEDIO || 0,
        multiplicador_maximo: row.MULTIPLICADOR_MAXIMO || 0,
        multiplicador_minimo: row.MULTIPLICADOR_MINIMO || 0
      };
      
    } catch (error) {
      throw this.manejarError(error);
    } finally {
      if (connection) await connection.close();
    }
  }

  formatearObjeto(row) {
    return {
      temporada_id: row.TEMPORADA_ID,
      hotel_id: row.HOTEL_ID,
      nombre_hotel: row.NOMBRE_HOTEL,
      nombre: row.NOMBRE,
      fecha_inicio: row.FECHA_INICIO,
      fecha_fin: row.FECHA_FIN,
      multiplicador_precio: row.MULTIPLICADOR_PRECIO,
      descripcion: row.DESCRIPCION,
      estado_vigencia: row.ESTADO_VIGENCIA,
      fecha_creacion: row.FECHA_CREACION,
      usuario_creacion: row.USUARIO_CREACION,
      fecha_modificacion: row.FECHA_MODIFICACION,
      usuario_modificacion: row.USUARIO_MODIFICACION
    };
  }

  manejarError(error) {
    if (error.errorNum) {
      const errorMap = {
        20001: { code: 'VALIDATION_ERROR', message: 'El hotel no existe o no está activo' },
        20002: { code: 'VALIDATION_ERROR', message: 'La fecha fin debe ser posterior a la fecha inicio' },
        20003: { code: 'VALIDATION_ERROR', message: 'El multiplicador debe ser mayor a cero' },
        20004: { code: 'CONFLICT', message: 'Las fechas se solapan con otra temporada existente' },
        20005: { code: 'NOT_FOUND', message: 'La temporada no existe' }
      };
      return errorMap[Math.abs(error.errorNum)] || { code: 'DATABASE_ERROR', message: error.message };
    }
    return error.code ? error : { code: 'INTERNAL_ERROR', message: error.message };
  }
}

module.exports = new TemporadaService();