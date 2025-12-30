// services/huespedService.js
const oracledb = require('oracledb');

/**
 * Insertar nuevo huésped
 */
const insertarHuesped = async (datos) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `BEGIN
         PKG_HUESPED.SP_INSERTAR_HUESPED(
           p_tipo_documento => :tipo_documento,
           p_numero_documento => :numero_documento,
           p_nombres => :nombres,
           p_apellidos => :apellidos,
           p_fecha_nacimiento => :fecha_nacimiento,
           p_genero => :genero,
           p_email => :email,
           p_telefono => :telefono,
           p_direccion => :direccion,
           p_ciudad => :ciudad,
           p_pais => :pais,
           p_membresia_id => :membresia_id,
           p_preferencias => :preferencias,
           p_usuario => :usuario,
           p_huesped_id => :huesped_id
         );
       END;`,
      {
        tipo_documento: datos.tipo_documento,
        numero_documento: datos.numero_documento,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        fecha_nacimiento: datos.fecha_nacimiento ? new Date(datos.fecha_nacimiento) : null,
        genero: datos.genero || 'O',
        email: datos.email,
        telefono: datos.telefono || null,
        direccion: datos.direccion || null,
        ciudad: datos.ciudad || null,
        pais: datos.pais || null,
        membresia_id: datos.membresia_id || null, // ← AGREGADO
        preferencias: datos.preferencias || null,
        usuario: datos.usuario || 'SYSTEM',
        huesped_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    return {
      id: result.outBinds.huesped_id,
      tipo_documento: datos.tipo_documento,
      numero_documento: datos.numero_documento,
      nombres: datos.nombres,
      apellidos: datos.apellidos,
      email: datos.email
    };

  } catch (error) {
    console.error('Error en insertarHuesped:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
};

/**
 * Actualizar huésped
 */
const actualizarHuesped = async (datos) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `BEGIN
         PKG_HUESPED.SP_ACTUALIZAR_HUESPED(
           p_huesped_id => :huesped_id,
           p_nombres => :nombres,
           p_apellidos => :apellidos,
           p_email => :email,
           p_telefono => :telefono,
           p_direccion => :direccion,
           p_ciudad => :ciudad,
           p_pais => :pais,
           p_membresia_id => :membresia_id,
           p_preferencias => :preferencias,
           p_usuario => :usuario
         );
       END;`,
      {
        huesped_id: datos.id,
        nombres: datos.nombres || null,
        apellidos: datos.apellidos || null,
        email: datos.email || null,
        telefono: datos.telefono || null,
        direccion: datos.direccion || null,
        ciudad: datos.ciudad || null,
        pais: datos.pais || null,
        membresia_id: datos.membresia_id || null, // ← AGREGADO
        preferencias: datos.preferencias || null,
        usuario: datos.usuario || 'SYSTEM'
      },
      { autoCommit: true }
    );

    return true;

  } catch (error) {
    console.error('Error en actualizarHuesped:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
};
/**
 * Eliminar huésped
 */
const eliminarHuesped = async (id, usuario = 'SYSTEM') => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `BEGIN
         PKG_HUESPED.SP_ELIMINAR_HUESPED(
           p_huesped_id => :huesped_id,
           p_usuario => :usuario
         );
       END;`,
      {
        huesped_id: id,
        usuario: usuario
      },
      { autoCommit: true }
    );

    return true;

  } catch (error) {
    console.error('Error en eliminarHuesped:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
};

/**
 * Obtener huésped por ID
 */
const obtenerHuespedPorId = async (id) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `BEGIN
         :cursor := PKG_HUESPED.FN_OBTENER_HUESPED(p_huesped_id => :id);
       END;`,
      {
        id: id,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1);
    await resultSet.close();

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return {
      id: row[0],
      tipo_documento: row[1],
      numero_documento: row[2],
      nombres: row[3],
      apellidos: row[4],
      fecha_nacimiento: row[5],
      genero: row[6],
      email: row[7],
      telefono: row[8],
      direccion: row[9],
      ciudad: row[10],
      pais: row[11],
      puntos_acumulados: row[12],
      preferencias: row[13],
      fecha_creacion: row[14],
      fecha_modificacion: row[15],
      membresia_id: row[16],
      membresia_nombre: row[17],
      membresia_nivel: row[18],
      descuento_porcentaje: row[19]
    };

  } catch (error) {
    console.error('Error en obtenerHuespedPorId:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
};

/**
 * Listar huéspedes
 */
const listarHuespedes = async (filtros = {}) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `BEGIN
         :cursor := PKG_HUESPED.FN_LISTAR_HUESPEDES(
           p_ciudad => :ciudad,
           p_pais => :pais,
           p_membresia_id => :membresia_id
         );
       END;`,
      {
        ciudad: filtros.ciudad || null,
        pais: filtros.pais || null,
        membresia_id: filtros.membresia_id || null,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1000);
    await resultSet.close();

    return rows.map(row => ({
      id: row[0],
      tipo_documento: row[1],
      numero_documento: row[2],
      nombres: row[3],
      apellidos: row[4],
      email: row[5],
      telefono: row[6],
      ciudad: row[7],
      pais: row[8],
      puntos_acumulados: row[9],
      fecha_creacion: row[10],
      membresia_nombre: row[11],
      membresia_nivel: row[12]
    }));

  } catch (error) {
    console.error('Error en listarHuespedes:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
};

/**
 * Buscar por documento
 */
const buscarPorDocumento = async (tipoDocumento, numeroDocumento) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `BEGIN
         :cursor := PKG_HUESPED.FN_BUSCAR_POR_DOCUMENTO(
           p_tipo_documento => :tipo_documento,
           p_numero_documento => :numero_documento
         );
       END;`,
      {
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1);
    await resultSet.close();

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];

    return {
      id: row[0],
      tipo_documento: row[1],
      numero_documento: row[2],
      nombres: row[3],
      apellidos: row[4],
      fecha_nacimiento: row[5],
      genero: row[6],
      email: row[7],
      telefono: row[8],
      direccion: row[9],
      ciudad: row[10],
      pais: row[11],
      puntos_acumulados: row[12],
      preferencias: row[13],
      membresia_nombre: row[14]
    };

  } catch (error) {
    console.error('Error en buscarPorDocumento:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
};

/**
 * Consultar puntos
 */
const consultarPuntos = async (id) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `BEGIN
         :puntos := PKG_HUESPED.FN_CONSULTAR_PUNTOS(p_huesped_id => :id);
       END;`,
      {
        id: id,
        puntos: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    return result.outBinds.puntos || 0;

  } catch (error) {
    console.error('Error en consultarPuntos:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
};

/**
 * Historial de puntos
 */
const historialPuntos = async (id) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `BEGIN
         :cursor := PKG_HUESPED.FN_HISTORIAL_PUNTOS(p_huesped_id => :id);
       END;`,
      {
        id: id,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );

    const resultSet = result.outBinds.cursor;
    const rows = await resultSet.getRows(1000);
    await resultSet.close();

    return rows.map(row => ({
      punto_id: row[0],
      tipo_movimiento: row[1],
      puntos: row[2],
      descripcion: row[3],
      fecha_expiracion: row[4],
      fecha_creacion: row[5],
      codigo_reserva: row[6]
    }));

  } catch (error) {
    console.error('Error en historialPuntos:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar conexión:', err);
      }
    }
  }
};

module.exports = {
  insertarHuesped,
  actualizarHuesped,
  eliminarHuesped,
  obtenerHuespedPorId,
  listarHuespedes,
  buscarPorDocumento,
  consultarPuntos,
  historialPuntos
};