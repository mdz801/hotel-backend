// services/experienciaService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class ExperienciaService {
  
  // Crear experiencia
  async crear(data) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_hotel_id: data.hotelId,
        p_nombre: data.nombre,
        p_descripcion: data.descripcion || null,
        p_tipo: data.tipo || null,
        p_duracion_horas: data.duracionHoras || null,
        p_capacidad_maxima: data.capacidadMaxima || null,
        p_precio_persona: data.precioPersona,
        p_incluye: data.incluye || null,
        p_lugar_salida: data.lugarSalida || null,
        p_usuario: data.usuario || 'SYSTEM',
        p_experiencia_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN 
          PKG_EXPERIENCIA.sp_crear_experiencia(
            :p_hotel_id,
            :p_nombre,
            :p_descripcion,
            :p_tipo,
            :p_duracion_horas,
            :p_capacidad_maxima,
            :p_precio_persona,
            :p_incluye,
            :p_lugar_salida,
            :p_usuario,
            :p_experiencia_id
          );
         END;`,
        binds
      );

      const experienciaId = result.outBinds.p_experiencia_id;
      
      // Retornar solo el ID y datos básicos sin hacer otra consulta
      return {
        experienciaId: experienciaId,
        hotelId: data.hotelId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        duracionHoras: data.duracionHoras,
        capacidadMaxima: data.capacidadMaxima,
        precioPersona: data.precioPersona,
        incluye: data.incluye,
        lugarSalida: data.lugarSalida,
        estado: 'ACTIVO'
      };
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Obtener experiencia por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          e.EXPERIENCIA_ID, e.HOTEL_ID, e.NOMBRE, e.DESCRIPCION, e.TIPO,
          e.DURACION_HORAS, e.CAPACIDAD_MAXIMA, e.PRECIO_PERSONA, 
          e.INCLUYE, e.LUGAR_SALIDA, e.ESTADO,
          h.NOMBRE as NOMBRE_HOTEL,
          e.FECHA_CREACION, e.USUARIO_CREACION,
          e.FECHA_MODIFICACION, e.USUARIO_MODIFICACION
         FROM EXPERIENCIA e
         INNER JOIN HOTEL h ON e.HOTEL_ID = h.HOTEL_ID
         WHERE e.EXPERIENCIA_ID = :id`,
        [id],
        { outFormat: oracledb.OUT_FORMAT_ARRAY }
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      
      // Cerrar conexión ANTES de retornar
      await connection.close();
      connection = null;
      
      return {
        experienciaId: Number(row[0]),
        hotelId: Number(row[1]),
        nombre: String(row[2] || ''),
        descripcion: row[3] ? String(row[3]) : null,
        tipo: row[4] ? String(row[4]) : null,
        duracionHoras: row[5] ? Number(row[5]) : null,
        capacidadMaxima: row[6] ? Number(row[6]) : null,
        precioPersona: Number(row[7]),
        incluye: row[8] ? String(row[8]) : null,
        lugarSalida: row[9] ? String(row[9]) : null,
        estado: String(row[10] || ''),
        nombreHotel: String(row[11] || ''),
        fechaCreacion: row[12],
        usuarioCreacion: row[13] ? String(row[13]) : null,
        fechaModificacion: row[14] || null,
        usuarioModificacion: row[15] ? String(row[15]) : null
      };

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar todas las experiencias
  async listar(filtros = {}) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      let query = `
        SELECT 
          e.EXPERIENCIA_ID, e.HOTEL_ID, e.NOMBRE, e.DESCRIPCION, e.TIPO,
          e.DURACION_HORAS, e.CAPACIDAD_MAXIMA, e.PRECIO_PERSONA,
          e.LUGAR_SALIDA, e.ESTADO,
          h.NOMBRE as NOMBRE_HOTEL,
          e.FECHA_CREACION
        FROM EXPERIENCIA e
        INNER JOIN HOTEL h ON e.HOTEL_ID = h.HOTEL_ID
        WHERE 1=1
      `;

      const binds = {};

      if (filtros.hotelId) {
        query += ' AND e.HOTEL_ID = :hotelId';
        binds.hotelId = filtros.hotelId;
      }

      if (filtros.tipo) {
        query += ' AND UPPER(e.TIPO) = UPPER(:tipo)';
        binds.tipo = filtros.tipo;
      }

      if (filtros.estado) {
        query += ' AND e.ESTADO = :estado';
        binds.estado = filtros.estado;
      }

      if (filtros.nombre) {
        query += ' AND UPPER(e.NOMBRE) LIKE UPPER(:nombre)';
        binds.nombre = `%${filtros.nombre}%`;
      }

      query += ' ORDER BY e.FECHA_CREACION DESC';

      const result = await connection.execute(query, binds, {
        outFormat: oracledb.OUT_FORMAT_ARRAY
      });

      return result.rows.map(row => ({
        experienciaId: row[0],
        hotelId: row[1],
        nombre: row[2],
        descripcion: row[3],
        tipo: row[4],
        duracionHoras: row[5],
        capacidadMaxima: row[6],
        precioPersona: row[7],
        lugarSalida: row[8],
        estado: row[9],
        nombreHotel: row[10],
        fechaCreacion: row[11]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Actualizar experiencia
  async actualizar(id, data) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_experiencia_id: id,
        p_nombre: data.nombre || null,
        p_descripcion: data.descripcion || null,
        p_tipo: data.tipo || null,
        p_duracion_horas: data.duracionHoras || null,
        p_capacidad_maxima: data.capacidadMaxima || null,
        p_precio_persona: data.precioPersona || null,
        p_incluye: data.incluye || null,
        p_lugar_salida: data.lugarSalida || null,
        p_usuario: data.usuario || 'SYSTEM'
      };

      await connection.execute(
        `BEGIN 
          PKG_EXPERIENCIA.sp_actualizar_experiencia(
            :p_experiencia_id,
            :p_nombre,
            :p_descripcion,
            :p_tipo,
            :p_duracion_horas,
            :p_capacidad_maxima,
            :p_precio_persona,
            :p_incluye,
            :p_lugar_salida,
            :p_usuario
          );
         END;`,
        binds
      );

      return await this.obtenerPorId(id);
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Cambiar estado
  async cambiarEstado(id, estado, usuario = 'SYSTEM') {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_experiencia_id: id,
        p_estado: estado,
        p_usuario: usuario
      };

      await connection.execute(
        `BEGIN PKG_EXPERIENCIA.sp_cambiar_estado(:p_experiencia_id, :p_estado, :p_usuario); END;`,
        binds
      );

      return await this.obtenerPorId(id);
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Eliminar experiencia
  async eliminar(id, usuario = 'SYSTEM') {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_experiencia_id: id,
        p_usuario: usuario
      };

      await connection.execute(
        `BEGIN PKG_EXPERIENCIA.sp_eliminar_experiencia(:p_experiencia_id, :p_usuario); END;`,
        binds
      );

      return true;
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Verificar nombre disponible
  async verificarNombreDisponible(hotelId, nombre, experienciaId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_hotel_id: hotelId,
        p_nombre: nombre,
        p_experiencia_id: experienciaId || null,
        p_disponible: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN :p_disponible := PKG_EXPERIENCIA.fn_verificar_nombre_disponible(:p_hotel_id, :p_nombre, :p_experiencia_id); END;`,
        binds
      );

      return result.outBinds.p_disponible === 1;
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Calcular precio total
  async calcularPrecioTotal(experienciaId, numeroPersonas) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_experiencia_id: experienciaId,
        p_numero_personas: numeroPersonas,
        p_total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN :p_total := PKG_EXPERIENCIA.fn_calcular_precio_total(:p_experiencia_id, :p_numero_personas); END;`,
        binds
      );

      return result.outBinds.p_total || 0;
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}

module.exports = new ExperienciaService();