// services/habitacionService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class HabitacionService {
  
  /**
   * CREAR HABITACIÓN
   * 
   * @param {Object} data - Datos de la habitación
   * @returns {Object} Habitación creada
   */
  async crear(data) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      const {
        hotelId,
        tipoHabitacionId,
        numeroHabitacion,
        piso,
        vista,
        estado = 'DISPONIBLE',
        observaciones = null,
        usuarioCreacion
      } = data;
      
      // Validar campos requeridos
      if (!hotelId || !tipoHabitacionId || !numeroHabitacion) {
        throw new Error('Faltan campos requeridos: hotelId, tipoHabitacionId, numeroHabitacion');
      }
      
      const result = await connection.execute(
        `BEGIN
          PKG_HABITACION.INS_HABITACION(
            :hotelId,
            :tipoHabitacionId,
            :numeroHabitacion,
            :piso,
            :vista,
            :estado,
            :observaciones,
            :usuarioCreacion,
            :habitacionId
          );
        END;`,
        {
          hotelId,
          tipoHabitacionId,
          numeroHabitacion,
          piso,
          vista,
          estado,
          observaciones,
          usuarioCreacion,
          habitacionId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: false }
      );
      
      const habitacionId = result.outBinds.habitacionId;
      await connection.commit();
      
      console.log(`✅ Habitación creada con ID: ${habitacionId}`);
      
      // Retornar habitación completa
      return await this.obtenerPorId(habitacionId);
      
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error('Error al crear habitación:', error.message);
      throw error;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * OBTENER HABITACIÓN POR ID
   */
  async obtenerPorId(id) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          H.HABITACION_ID,
          H.HOTEL_ID,
          H.TIPO_HABITACION_ID,
          H.NUMERO_HABITACION,
          H.PISO,
          H.VISTA,
          H.ESTADO,
          H.OBSERVACIONES,
          TH.NOMBRE AS TIPO_HABITACION,
          TH.DESCRIPCION AS TIPO_DESCRIPCION,
          TH.CAPACIDAD_ADULTOS,
          TH.CAPACIDAD_NINOS,
          TH.METROS_CUADRADOS,
          TH.TIPO_CAMA,
          TH.AMENIDADES,
          HOT.NOMBRE AS HOTEL_NOMBRE,
          HOT.CIUDAD,
          HOT.PAIS,
          TO_CHAR(H.FECHA_CREACION, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_CREACION,
          H.USUARIO_CREACION,
          TO_CHAR(H.FECHA_MODIFICACION, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_MODIFICACION,
          H.USUARIO_MODIFICACION
        FROM HABITACION H
        INNER JOIN TIPO_HABITACION TH ON H.TIPO_HABITACION_ID = TH.TIPO_HABITACION_ID
        INNER JOIN HOTEL HOT ON H.HOTEL_ID = HOT.HOTEL_ID
        WHERE H.HABITACION_ID = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * LISTAR HABITACIONES CON FILTROS
   * 
   * Filtros disponibles:
   * - hotelId
   * - tipoHabitacionId
   * - estado
   * - piso
   * - numeroHabitacion (búsqueda parcial)
   * - capacidadMinima
   */
  async listar(filtros = {}) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      let query = `
        SELECT 
          H.HABITACION_ID,
          H.HOTEL_ID,
          H.TIPO_HABITACION_ID,
          H.NUMERO_HABITACION,
          H.PISO,
          H.VISTA,
          H.ESTADO,
          H.OBSERVACIONES,
          TH.NOMBRE AS TIPO_HABITACION,
          TH.CAPACIDAD_ADULTOS,
          TH.CAPACIDAD_NINOS,
          TH.METROS_CUADRADOS,
          HOT.NOMBRE AS HOTEL_NOMBRE,
          TO_CHAR(H.FECHA_CREACION, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_CREACION
        FROM HABITACION H
        INNER JOIN TIPO_HABITACION TH ON H.TIPO_HABITACION_ID = TH.TIPO_HABITACION_ID
        INNER JOIN HOTEL HOT ON H.HOTEL_ID = HOT.HOTEL_ID
        WHERE 1=1
      `;
      
      const bindParams = {};
      
      if (filtros.hotelId) {
        query += ' AND H.HOTEL_ID = :hotelId';
        bindParams.hotelId = filtros.hotelId;
      }
      
      if (filtros.tipoHabitacionId) {
        query += ' AND H.TIPO_HABITACION_ID = :tipoHabitacionId';
        bindParams.tipoHabitacionId = filtros.tipoHabitacionId;
      }
      
      if (filtros.estado) {
        query += ' AND H.ESTADO = :estado';
        bindParams.estado = filtros.estado;
      }
      
      if (filtros.piso) {
        query += ' AND H.PISO = :piso';
        bindParams.piso = filtros.piso;
      }
      
      if (filtros.numeroHabitacion) {
        query += ' AND UPPER(H.NUMERO_HABITACION) LIKE UPPER(:numeroHabitacion)';
        bindParams.numeroHabitacion = `%${filtros.numeroHabitacion}%`;
      }
      
      if (filtros.capacidadMinima) {
        query += ' AND TH.CAPACIDAD_ADULTOS >= :capacidadMinima';
        bindParams.capacidadMinima = filtros.capacidadMinima;
      }
      
      query += ' ORDER BY H.PISO, H.NUMERO_HABITACION';
      
      const result = await connection.execute(
        query,
        bindParams,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      console.log(`✅ ${result.rows.length} habitaciones encontradas`);
      return result.rows;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * ACTUALIZAR HABITACIÓN
   */
  async actualizar(id, data) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      const {
        tipoHabitacionId,
        numeroHabitacion,
        piso,
        vista,
        estado,
        observaciones,
        usuarioModificacion
      } = data;
      
      // Validar que la habitación existe
      const existe = await this.obtenerPorId(id);
      if (!existe) {
        throw new Error(`Habitación con ID ${id} no encontrada`);
      }
      
      await connection.execute(
        `BEGIN
          PKG_HABITACION.UPD_HABITACION(
            :id,
            :tipoHabitacionId,
            :numeroHabitacion,
            :piso,
            :vista,
            :estado,
            :observaciones,
            :usuarioModificacion
          );
        END;`,
        {
          id,
          tipoHabitacionId,
          numeroHabitacion,
          piso,
          vista,
          estado,
          observaciones,
          usuarioModificacion
        },
        { autoCommit: true }
      );
      
      console.log(`✅ Habitación ${id} actualizada`);
      return await this.obtenerPorId(id);
      
    } catch (error) {
      console.error('Error al actualizar habitación:', error.message);
      throw error;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * CAMBIAR ESTADO DE HABITACIÓN
   */
  async cambiarEstado(id, nuevoEstado, observaciones = null, usuario) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_HABITACION.CAMBIAR_ESTADO(
            :id,
            :nuevoEstado,
            :observaciones,
            :usuario
          );
        END;`,
        {
          id,
          nuevoEstado,
          observaciones,
          usuario
        },
        { autoCommit: true }
      );
      
      console.log(`✅ Estado de habitación ${id} cambiado a ${nuevoEstado}`);
      return await this.obtenerPorId(id);
      
    } catch (error) {
      console.error('Error al cambiar estado:', error.message);
      throw error;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * ELIMINAR HABITACIÓN (bloquear)
   */
  async eliminar(id, usuario) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_HABITACION.DEL_HABITACION(:id, :usuario);
        END;`,
        { id, usuario },
        { autoCommit: true }
      );
      
      console.log(`✅ Habitación ${id} bloqueada/eliminada`);
      return { success: true, message: 'Habitación eliminada exitosamente' };
      
    } catch (error) {
      console.error('Error al eliminar habitación:', error.message);
      throw error;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * VERIFICAR SI HABITACIÓN ESTÁ OCUPADA
   * @returns {boolean} true si está ocupada, false si está libre
   */
  async estaOcupada(habitacionId, fechaInicio = null, fechaFin = null) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      const params = {
        habitacionId,
        fechaInicio: fechaInicio || new Date().toISOString().split('T')[0],
        fechaFin: fechaFin || new Date().toISOString().split('T')[0],
        resultado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };
      
      const result = await connection.execute(
        `BEGIN
          :resultado := PKG_HABITACION.ESTA_OCUPADA(
            :habitacionId,
            TO_DATE(:fechaInicio, 'YYYY-MM-DD'),
            TO_DATE(:fechaFin, 'YYYY-MM-DD')
          );
        END;`,
        params
      );
      
      return Number(result.outBinds.resultado) === 1;
      
    } catch (error) {
      console.error('Error al verificar ocupación:', error.message);
      throw error;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * OBTENER HABITACIONES POR ESTADO (usando cursor)
   */
  async obtenerPorEstado(hotelId, estado = null) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `BEGIN
          PKG_HABITACION.GET_HABITACIONES_POR_ESTADO(
            :hotelId,
            :estado,
            :cursor
          );
        END;`,
        {
          hotelId,
          estado,
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        }
      );
      
      const cursor = result.outBinds.cursor;
      const rows = await cursor.getRows(1000);
      await cursor.close();
      
      console.log(`✅ ${rows.length} habitaciones encontradas con estado ${estado || 'todos'}`);
      return rows;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * INICIAR MANTENIMIENTO
   */
  async iniciarMantenimiento(habitacionId, observaciones, usuario) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_HABITACION.INICIAR_MANTENIMIENTO(
            :habitacionId,
            :observaciones,
            :usuario
          );
        END;`,
        { habitacionId, observaciones, usuario },
        { autoCommit: true }
      );
      
      console.log(`✅ Mantenimiento iniciado en habitación ${habitacionId}`);
      return await this.obtenerPorId(habitacionId);
      
    } catch (error) {
      console.error('Error al iniciar mantenimiento:', error.message);
      throw error;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * FINALIZAR MANTENIMIENTO
   */
  async finalizarMantenimiento(habitacionId, usuario) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_HABITACION.FINALIZAR_MANTENIMIENTO(:habitacionId, :usuario);
        END;`,
        { habitacionId, usuario },
        { autoCommit: true }
      );
      
      console.log(`✅ Mantenimiento finalizado en habitación ${habitacionId}`);
      return await this.obtenerPorId(habitacionId);
      
    } catch (error) {
      console.error('Error al finalizar mantenimiento:', error.message);
      throw error;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * OBTENER HABITACIONES DISPONIBLES PARA FECHAS
   * (Usa la lógica de disponibilidad del paquete de reservas)
   */
  async obtenerDisponibles(hotelId, fechaCheckin, fechaCheckout, capacidadAdultos = 1) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      // Obtener habitaciones del hotel que cumplan capacidad
      const result = await connection.execute(
        `SELECT 
          H.HABITACION_ID,
          H.NUMERO_HABITACION,
          H.PISO,
          H.VISTA,
          H.ESTADO,
          TH.NOMBRE AS TIPO_HABITACION,
          TH.CAPACIDAD_ADULTOS,
          TH.CAPACIDAD_NINOS,
          TH.METROS_CUADRADOS,
          TH.AMENIDADES
        FROM HABITACION H
        INNER JOIN TIPO_HABITACION TH ON H.TIPO_HABITACION_ID = TH.TIPO_HABITACION_ID
        WHERE H.HOTEL_ID = :hotelId
          AND TH.CAPACIDAD_ADULTOS >= :capacidadAdultos
          AND H.ESTADO IN ('DISPONIBLE', 'LIMPIEZA')
        ORDER BY H.PISO, H.NUMERO_HABITACION`,
        { hotelId, capacidadAdultos },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const disponibles = [];
      
      // Verificar disponibilidad para cada habitación
      for (const hab of result.rows) {
        const disponible = await connection.execute(
          `BEGIN
            :resultado := PKG_RESERVA.VERIFICAR_DISPONIBILIDAD(
              :habitacionId,
              TO_DATE(:fechaCheckin, 'YYYY-MM-DD'),
              TO_DATE(:fechaCheckout, 'YYYY-MM-DD'),
              NULL
            );
          END;`,
          {
            habitacionId: hab.HABITACION_ID,
            fechaCheckin,
            fechaCheckout,
            resultado: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          }
        );
        
        if (Number(disponible.outBinds.resultado) === 1) {
          disponibles.push(hab);
        }
      }
      
      console.log(`✅ ${disponibles.length} habitaciones disponibles`);
      return disponibles;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * OBTENER ESTADÍSTICAS DE HABITACIONES
   */
  async obtenerEstadisticas(hotelId) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          COUNT(*) AS TOTAL_HABITACIONES,
          SUM(CASE WHEN H.ESTADO = 'DISPONIBLE' THEN 1 ELSE 0 END) AS DISPONIBLES,
          SUM(CASE WHEN H.ESTADO = 'OCUPADA' THEN 1 ELSE 0 END) AS OCUPADAS,
          SUM(CASE WHEN H.ESTADO = 'LIMPIEZA' THEN 1 ELSE 0 END) AS EN_LIMPIEZA,
          SUM(CASE WHEN H.ESTADO = 'MANTENIMIENTO' THEN 1 ELSE 0 END) AS EN_MANTENIMIENTO,
          SUM(CASE WHEN H.ESTADO = 'BLOQUEADA' THEN 1 ELSE 0 END) AS BLOQUEADAS,
          ROUND(
            (SUM(CASE WHEN H.ESTADO = 'OCUPADA' THEN 1 ELSE 0 END) / 
            NULLIF(COUNT(*), 0)) * 100, 2
          ) AS PORCENTAJE_OCUPACION
        FROM HABITACION H
        WHERE H.HOTEL_ID = :hotelId`,
        { hotelId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      return result.rows[0];
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}

module.exports = new HabitacionService();