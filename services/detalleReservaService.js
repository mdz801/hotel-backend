// services/detalleReservaService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class DetalleReservaService {
  
  // Agregar habitación a reserva
  async agregar(data) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_reserva_id: data.reservaId,
        p_habitacion_id: data.habitacionId,
        p_tarifa_aplicada: data.tarifaAplicada,
        p_numero_noches: data.numeroNoches,
        p_usuario: data.usuario || 'SYSTEM',
        p_detalle_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN 
          PKG_DETALLE_RESERVA.sp_agregar_habitacion(
            :p_reserva_id,
            :p_habitacion_id,
            :p_tarifa_aplicada,
            :p_numero_noches,
            :p_usuario,
            :p_detalle_id
          );
         END;`,
        binds
      );

      const detalleId = result.outBinds.p_detalle_id;
      return await this.obtenerPorId(detalleId);
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Obtener detalle por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_detalle_id: id,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_DETALLE_RESERVA.fn_obtener_detalle_por_id(:p_detalle_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1);
      await resultSet.close();

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      
      // Cerrar conexión antes de retornar
      await connection.close();
      connection = null;
      
      return {
        detalleId: Number(row[0]),
        reservaId: Number(row[1]),
        habitacionId: Number(row[2]),
        tarifaAplicada: Number(row[3]),
        numeroNoches: Number(row[4]),
        subtotal: Number(row[5]),
        codigoReserva: String(row[6] || ''),
        numeroHabitacion: String(row[7] || ''),
        tipoHabitacion: String(row[8] || ''),
        nombreHotel: String(row[9] || ''),
        fechaCreacion: row[10],
        usuarioCreacion: row[11] ? String(row[11]) : null,
        fechaModificacion: row[12] || null,
        usuarioModificacion: row[13] ? String(row[13]) : null
      };

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar todos los detalles
  async listar() {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_DETALLE_RESERVA.fn_listar_detalles(); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        detalleId: Number(row[0]),
        reservaId: Number(row[1]),
        habitacionId: Number(row[2]),
        tarifaAplicada: Number(row[3]),
        numeroNoches: Number(row[4]),
        subtotal: Number(row[5]),
        codigoReserva: String(row[6] || ''),
        numeroHabitacion: String(row[7] || ''),
        tipoHabitacion: String(row[8] || ''),
        fechaCreacion: row[9]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar detalles por reserva
  async listarPorReserva(reservaId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_reserva_id: reservaId,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_DETALLE_RESERVA.fn_listar_por_reserva(:p_reserva_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        detalleId: Number(row[0]),
        habitacionId: Number(row[1]),
        numeroHabitacion: String(row[2] || ''),
        tipoHabitacion: String(row[3] || ''),
        tarifaAplicada: Number(row[4]),
        numeroNoches: Number(row[5]),
        subtotal: Number(row[6]),
        fechaCreacion: row[7]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Actualizar detalle
  async actualizar(id, data) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_detalle_id: id,
        p_tarifa_aplicada: data.tarifaAplicada || null,
        p_numero_noches: data.numeroNoches || null,
        p_usuario: data.usuario || 'SYSTEM'
      };

      await connection.execute(
        `BEGIN 
          PKG_DETALLE_RESERVA.sp_actualizar_detalle(
            :p_detalle_id,
            :p_tarifa_aplicada,
            :p_numero_noches,
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

  // Eliminar detalle
  async eliminar(id) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_detalle_id: id
      };

      await connection.execute(
        `BEGIN PKG_DETALLE_RESERVA.sp_eliminar_detalle(:p_detalle_id); END;`,
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

  // Calcular subtotal de un detalle
  async calcularSubtotalDetalle(detalleId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_detalle_id: detalleId,
        p_subtotal: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN :p_subtotal := PKG_DETALLE_RESERVA.fn_calcular_subtotal_detalle(:p_detalle_id); END;`,
        binds
      );

      return result.outBinds.p_subtotal || 0;
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Calcular total de una reserva (suma de todos sus detalles)
  async calcularTotalReserva(reservaId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_reserva_id: reservaId,
        p_total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN :p_total := PKG_DETALLE_RESERVA.fn_calcular_total_reserva(:p_reserva_id); END;`,
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

  // Obtener estadísticas
  async obtenerEstadisticas(reservaId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_reserva_id: reservaId || null,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_DETALLE_RESERVA.fn_obtener_estadisticas(:p_reserva_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        totalDetalles: Number(row[0]),
        totalReservas: Number(row[1]),
        habitacionesDiferentes: Number(row[2]),
        totalIngresos: Number(row[3]),
        tarifaPromedio: Number(row[4]),
        nochesPromedio: Number(row[5]),
        tipoHabitacionMasReservado: String(row[6] || ''),
        vecesReservado: Number(row[7])
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
}

module.exports = new DetalleReservaService();