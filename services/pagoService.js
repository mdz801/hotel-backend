// services/pagoService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class PagoService {
  
  // Crear pago
  async crear(data) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_reserva_id: data.reservaId,
        p_monto: data.monto,
        p_moneda: data.moneda || 'USD',
        p_metodo_pago: data.metodoPago,
        p_referencia_externa: data.referenciaExterna || null,
        p_descripcion: data.descripcion || null,
        p_usuario: data.usuario || 'SYSTEM',
        p_pago_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN 
          PKG_PAGO.sp_crear_pago(
            :p_reserva_id,
            :p_monto,
            :p_moneda,
            :p_metodo_pago,
            :p_referencia_externa,
            :p_descripcion,
            :p_usuario,
            :p_pago_id
          );
         END;`,
        binds
      );

      const pagoId = result.outBinds.p_pago_id;
      return await this.obtenerPorId(pagoId);
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Obtener pago por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_pago_id: id,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_PAGO.fn_obtener_pago_por_id(:p_pago_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1);
      await resultSet.close();

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        pagoId: row[0],
        reservaId: row[1],
        numeroTransaccion: row[2],
        fechaPago: row[3],
        monto: row[4],
        moneda: row[5],
        metodoPago: row[6],
        estado: row[7],
        referenciaExterna: row[8],
        descripcion: row[9],
        codigoReserva: row[10],
        totalReserva: row[11],
        nombreHuesped: row[12],
        nombreHotel: row[13],
        fechaCreacion: row[14],
        usuarioCreacion: row[15],
        fechaModificacion: row[16],
        usuarioModificacion: row[17]
      };

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar todos los pagos
  async listar() {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_PAGO.fn_listar_pagos(); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        pagoId: row[0],
        reservaId: row[1],
        numeroTransaccion: row[2],
        fechaPago: row[3],
        monto: row[4],
        moneda: row[5],
        metodoPago: row[6],
        estado: row[7],
        codigoReserva: row[8],
        nombreHuesped: row[9],
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

  // Listar pagos por reserva
  async listarPorReserva(reservaId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_reserva_id: reservaId,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_PAGO.fn_listar_por_reserva(:p_reserva_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        pagoId: row[0],
        numeroTransaccion: row[1],
        fechaPago: row[2],
        monto: row[3],
        moneda: row[4],
        metodoPago: row[5],
        estado: row[6],
        referenciaExterna: row[7],
        descripcion: row[8],
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

  // Listar pagos por estado
  async listarPorEstado(estado) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_estado: estado,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_PAGO.fn_listar_por_estado(:p_estado); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        pagoId: row[0],
        reservaId: row[1],
        numeroTransaccion: row[2],
        fechaPago: row[3],
        monto: row[4],
        moneda: row[5],
        metodoPago: row[6],
        estado: row[7],
        codigoReserva: row[8],
        nombreHuesped: row[9],
        nombreHotel: row[10]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar pagos por método de pago
  async listarPorMetodo(metodoPago) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_metodo_pago: metodoPago,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_PAGO.fn_listar_por_metodo(:p_metodo_pago); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        pagoId: row[0],
        reservaId: row[1],
        numeroTransaccion: row[2],
        fechaPago: row[3],
        monto: row[4],
        moneda: row[5],
        estado: row[6],
        codigoReserva: row[7],
        nombreHuesped: row[8]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Actualizar pago
  async actualizar(id, data) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_pago_id: id,
        p_monto: data.monto || null,
        p_metodo_pago: data.metodoPago || null,
        p_referencia_externa: data.referenciaExterna || null,
        p_descripcion: data.descripcion || null,
        p_usuario: data.usuario || 'SYSTEM'
      };

      await connection.execute(
        `BEGIN 
          PKG_PAGO.sp_actualizar_pago(
            :p_pago_id,
            :p_monto,
            :p_metodo_pago,
            :p_referencia_externa,
            :p_descripcion,
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

  // Aprobar pago
  async aprobar(id, usuario = 'SYSTEM') {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_pago_id: id,
        p_usuario: usuario
      };

      await connection.execute(
        `BEGIN PKG_PAGO.sp_aprobar_pago(:p_pago_id, :p_usuario); END;`,
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

  // Rechazar pago
  async rechazar(id, usuario = 'SYSTEM') {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_pago_id: id,
        p_usuario: usuario
      };

      await connection.execute(
        `BEGIN PKG_PAGO.sp_rechazar_pago(:p_pago_id, :p_usuario); END;`,
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

  // Reembolsar pago
  async reembolsar(id, usuario = 'SYSTEM') {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_pago_id: id,
        p_usuario: usuario
      };

      await connection.execute(
        `BEGIN PKG_PAGO.sp_reembolsar_pago(:p_pago_id, :p_usuario); END;`,
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

  // Eliminar pago (solo PENDIENTE)
  async eliminar(id) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_pago_id: id
      };

      await connection.execute(
        `BEGIN PKG_PAGO.sp_eliminar_pago(:p_pago_id); END;`,
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

  // Obtener total pagado por reserva
  async obtenerTotalPagadoReserva(reservaId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_reserva_id: reservaId,
        p_total: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN :p_total := PKG_PAGO.fn_total_pagado_reserva(:p_reserva_id); END;`,
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

  // Obtener saldo pendiente de reserva
  async obtenerSaldoPendienteReserva(reservaId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_reserva_id: reservaId,
        p_saldo: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN :p_saldo := PKG_PAGO.fn_saldo_pendiente_reserva(:p_reserva_id); END;`,
        binds
      );

      return result.outBinds.p_saldo || 0;
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Obtener estadísticas
  async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_fecha_inicio: fechaInicio || null,
        p_fecha_fin: fechaFin || null,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_PAGO.fn_obtener_estadisticas(:p_fecha_inicio, :p_fecha_fin); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        totalPagos: row[0],
        aprobados: row[1],
        pendientes: row[2],
        rechazados: row[3],
        reembolsados: row[4],
        montoAprobado: row[5],
        montoPendiente: row[6],
        reservasConPago: row[7],
        metodoPago: row[8],
        cantidadPorMetodo: row[9]
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

module.exports = new PagoService();