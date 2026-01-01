const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class PuntosFidelizacionService {
  
  async acumularPuntos(huespedId, puntos, descripcion, usuario, reservaId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_PUNTOS_FIDELIZACION.sp_acumular_puntos(
            p_huesped_id => :huespedId,
            p_puntos => :puntos,
            p_descripcion => :descripcion,
            p_reserva_id => :reservaId,
            p_usuario => :usuario
          );
        END;`,
        {
          huespedId: huespedId,
          puntos: puntos,
          descripcion: descripcion,
          reservaId: reservaId,
          usuario: usuario
        }
      );
      
      await connection.close();
      connection = null;
      
      return {
        huespedId: Number(huespedId),
        puntos: Number(puntos),
        tipo: 'ACUMULACION',
        descripcion: String(descripcion)
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async canjearPuntos(huespedId, puntos, descripcion, usuario, reservaId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_PUNTOS_FIDELIZACION.sp_canjear_puntos(
            p_huesped_id => :huespedId,
            p_puntos => :puntos,
            p_descripcion => :descripcion,
            p_reserva_id => :reservaId,
            p_usuario => :usuario
          );
        END;`,
        {
          huespedId: huespedId,
          puntos: puntos,
          descripcion: descripcion,
          reservaId: reservaId,
          usuario: usuario
        }
      );
      
      await connection.close();
      connection = null;
      
      return {
        huespedId: Number(huespedId),
        puntos: Number(puntos),
        tipo: 'CANJE',
        descripcion: String(descripcion)
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async ajustarPuntos(huespedId, puntos, descripcion, usuario) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_PUNTOS_FIDELIZACION.sp_ajustar_puntos(
            p_huesped_id => :huespedId,
            p_puntos => :puntos,
            p_descripcion => :descripcion,
            p_usuario => :usuario
          );
        END;`,
        {
          huespedId: huespedId,
          puntos: puntos,
          descripcion: descripcion,
          usuario: usuario
        }
      );
      
      await connection.close();
      connection = null;
      
      return {
        huespedId: Number(huespedId),
        puntos: Number(puntos),
        tipo: 'AJUSTE',
        descripcion: String(descripcion)
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async obtenerSaldo(huespedId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT PKG_PUNTOS_FIDELIZACION.fn_obtener_saldo(:huespedId) AS SALDO FROM DUAL`,
        { huespedId: huespedId }
      );
      
      const saldo = result.rows[0][0];
      await connection.close();
      connection = null;
      
      return {
        huespedId: Number(huespedId),
        saldo: Number(saldo || 0)
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async obtenerPuntosPorExpirar(huespedId, dias = 30) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT PKG_PUNTOS_FIDELIZACION.fn_obtener_puntos_por_expirar(:huespedId, :dias) AS PUNTOS FROM DUAL`,
        { 
          huespedId: huespedId,
          dias: dias
        }
      );
      
      const puntos = result.rows[0][0];
      await connection.close();
      connection = null;
      
      return {
        huespedId: Number(huespedId),
        dias: Number(dias),
        puntosPorExpirar: Number(puntos || 0)
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async listarTransacciones(huespedId, tipo = null, limite = 50) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `BEGIN
          :cursor := PKG_PUNTOS_FIDELIZACION.fn_listar_transacciones(
            p_huesped_id => :huespedId,
            p_tipo => :tipo,
            p_limite => :limite
          );
        END;`,
        {
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          huespedId: huespedId,
          tipo: tipo,
          limite: limite
        }
      );
      
      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows();
      await resultSet.close();
      await connection.close();
      connection = null;
      
      return rows.map(row => ({
        puntoId: Number(row[0]),
        huespedId: Number(row[1]),
        tipo: String(row[2] || ''),
        puntos: Number(row[3]),
        descripcion: String(row[4] || ''),
        reservaId: row[5] ? Number(row[5]) : null,
        fechaTransaccion: row[6],
        fechaExpiracion: row[7] || null,
        estado: String(row[8] || '')
      }));
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async obtenerTransaccion(puntoId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `BEGIN
          :cursor := PKG_PUNTOS_FIDELIZACION.fn_obtener_transaccion(:puntoId);
        END;`,
        {
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          puntoId: puntoId
        }
      );
      
      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows();
      await resultSet.close();
      await connection.close();
      connection = null;
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return {
        puntoId: Number(row[0]),
        huespedId: Number(row[1]),
        huespedNombre: String(row[2] || ''),
        tipo: String(row[3] || ''),
        puntos: Number(row[4]),
        descripcion: String(row[5] || ''),
        reservaId: row[6] ? Number(row[6]) : null,
        fechaTransaccion: row[7],
        fechaExpiracion: row[8] || null,
        estado: String(row[9] || '')
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async obtenerEstadisticas(huespedId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `BEGIN
          :cursor := PKG_PUNTOS_FIDELIZACION.fn_obtener_estadisticas(:huespedId);
        END;`,
        {
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
          huespedId: huespedId
        }
      );
      
      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows();
      await resultSet.close();
      await connection.close();
      connection = null;
      
      if (rows.length === 0) {
        return null;
      }
      
      const row = rows[0];
      return {
        huespedId: Number(row[0]),
        saldoActual: Number(row[1] || 0),
        puntosPorExpirar30Dias: Number(row[2] || 0),
        totalAcumulado: Number(row[3] || 0),
        totalCanjeado: Number(row[4] || 0),
        totalTransacciones: Number(row[5] || 0),
        totalExpirado: Number(row[6] || 0)
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async expirarPuntos(usuario, huespedId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_PUNTOS_FIDELIZACION.sp_expirar_puntos(
            p_huesped_id => :huespedId,
            p_usuario => :usuario
          );
        END;`,
        { 
          huespedId: huespedId,
          usuario: usuario
        }
      );
      
      await connection.close();
      connection = null;
      
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async eliminarTransaccion(puntoId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      await connection.execute(
        `BEGIN
          PKG_PUNTOS_FIDELIZACION.sp_eliminar_transaccion(p_punto_id => :puntoId);
        END;`,
        { puntoId: puntoId }
      );
      
      await connection.close();
      connection = null;
      
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async verificarPuntosSuficientes(huespedId, puntos) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT PKG_PUNTOS_FIDELIZACION.fn_verificar_puntos_suficientes(:huespedId, :puntos) AS RESULTADO FROM DUAL`,
        {
          huespedId: huespedId,
          puntos: puntos
        }
      );
      
      const resultado = result.rows[0][0];
      await connection.close();
      connection = null;
      
      return {
        huespedId: Number(huespedId),
        puntosRequeridos: Number(puntos),
        suficiente: String(resultado) === 'S'
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }

  async calcularPuntosReserva(huespedId, montoTotal) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT PKG_PUNTOS_FIDELIZACION.fn_calcular_puntos_reserva(:huespedId, :montoTotal) AS PUNTOS FROM DUAL`,
        {
          huespedId: huespedId,
          montoTotal: montoTotal
        }
      );
      
      const puntos = result.rows[0][0];
      await connection.close();
      connection = null;
      
      return {
        huespedId: Number(huespedId),
        montoTotal: Number(montoTotal),
        puntosCalculados: Number(puntos || 0)
      };
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error('Error cerrando conexión:', err);
        }
      }
    }
  }
}

module.exports = new PuntosFidelizacionService();