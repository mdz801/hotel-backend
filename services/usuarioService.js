// services/usuarioService.js
const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');

/**
 * Insertar nuevo usuario
 */
const insertarUsuario = async (datos) => {
  let connection;
  try {
    // Obtener conexión del pool
    connection = await oracledb.getConnection();

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(datos.password, 10);

    const result = await connection.execute(
      `BEGIN
         PKG_USUARIO.INS_USUARIO(
           p_username => :username,
           p_password_hash => :password_hash,
           p_email => :email,
           p_nombres => :nombres,
           p_apellidos => :apellidos,
           p_hotel_id => :hotel_id,
           p_usuario_creacion => :usuario_creacion,
           p_usuario_id => :p_usuario_id
         );
       END;`,
      {
        username: datos.email.split('@')[0],
        password_hash: passwordHash,
        email: datos.email,
        nombres: datos.nombre,
        apellidos: datos.apellido || '',
        hotel_id: datos.hotel_id ? Number(datos.hotel_id) : null,
        usuario_creacion: 'SYSTEM',
        p_usuario_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: true }
    );

    const usuarioId = result.outBinds.p_usuario_id;

    // Asignar rol al usuario
    if (datos.rol_id) {
      await connection.execute(
        `INSERT INTO USUARIO_ROL (USUARIO_ROL_ID, USUARIO_ID, ROL_ID)
         VALUES (SEQ_USUARIO_ROL.NEXTVAL, :usuario_id, :rol_id)`,
        {
          usuario_id: usuarioId,
          rol_id: datos.rol_id
        },
        { autoCommit: true }
      );
    }

    return {
      id: usuarioId,
      nombre: datos.nombre,
      email: datos.email
    };

  } catch (error) {
    console.error('Error en insertarUsuario:', error);
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
 * Login de usuario
 */
const loginUsuario = async (email, password) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT 
         u.USUARIO_ID,
         u.USERNAME,
         u.PASSWORD_HASH,
         u.EMAIL,
         u.NOMBRES,
         u.APELLIDOS,
         u.ESTADO,
         u.HOTEL_ID,
         r.NOMBRE as ROL_NOMBRE
       FROM USUARIO u
       LEFT JOIN USUARIO_ROL ur ON u.USUARIO_ID = ur.USUARIO_ID
       LEFT JOIN ROL r ON ur.ROL_ID = r.ROL_ID
       WHERE UPPER(TRIM(u.EMAIL)) = UPPER(TRIM(:email))`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return null;
    }

    const usuario = result.rows[0];

    // Verificar estado
    if (usuario.ESTADO.trim().toUpperCase() !== 'ACTIVO') {
      return null;
    }

    // Verificar contraseña
    const passwordValido = await bcrypt.compare(password, usuario.PASSWORD_HASH);

    if (!passwordValido) {
      // Incrementar intentos fallidos
      await connection.execute(
        `UPDATE USUARIO 
         SET INTENTOS_FALLIDOS = INTENTOS_FALLIDOS + 1,
             FECHA_MODIFICACION = SYSTIMESTAMP
         WHERE USUARIO_ID = :id`,
        { id: usuario.USUARIO_ID },
        { autoCommit: true }
      );
      return null;
    }

    // Actualizar último acceso y resetear intentos fallidos
    await connection.execute(
      `UPDATE USUARIO 
       SET ULTIMO_ACCESO = SYSTIMESTAMP,
           INTENTOS_FALLIDOS = 0,
           FECHA_MODIFICACION = SYSTIMESTAMP
       WHERE USUARIO_ID = :id`,
      { id: usuario.USUARIO_ID },
      { autoCommit: true }
    );

    return {
      id: usuario.USUARIO_ID,
      username: usuario.USERNAME,
      nombre: usuario.NOMBRES,
      apellido: usuario.APELLIDOS,
      email: usuario.EMAIL,
      estado: usuario.ESTADO,
      hotel_id: usuario.HOTEL_ID,
      rol_nombre: usuario.ROL_NOMBRE
    };

  } catch (error) {
    console.error('Error en loginUsuario:', error);
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
 * Obtener usuario por ID
 */
const obtenerUsuarioPorId = async (id) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const result = await connection.execute(
      `SELECT 
         u.USUARIO_ID,
         u.USERNAME,
         u.EMAIL,
         u.NOMBRES,
         u.APELLIDOS,
         u.ESTADO,
         u.HOTEL_ID,
         u.ULTIMO_ACCESO,
         u.FECHA_CREACION,
         r.NOMBRE as ROL_NOMBRE,
         r.ROL_ID
       FROM USUARIO u
       LEFT JOIN USUARIO_ROL ur ON u.USUARIO_ID = ur.USUARIO_ID
       LEFT JOIN ROL r ON ur.ROL_ID = r.ROL_ID
       WHERE u.USUARIO_ID = :id`,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return null;
    }

    const usuario = result.rows[0];

    return {
      id: usuario.USUARIO_ID,
      username: usuario.USERNAME,
      nombre: usuario.NOMBRES,
      apellido: usuario.APELLIDOS,
      email: usuario.EMAIL,
      estado: usuario.ESTADO,
      hotel_id: usuario.HOTEL_ID,
      ultimo_acceso: usuario.ULTIMO_ACCESO,
      fecha_registro: usuario.FECHA_CREACION,
      rol_nombre: usuario.ROL_NOMBRE,
      rol_id: usuario.ROL_ID
    };

  } catch (error) {
    console.error('Error en obtenerUsuarioPorId:', error);
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
 * Listar usuarios
 */
const listarUsuarios = async (filtros = {}) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    let query = `
      SELECT 
        u.USUARIO_ID,
        u.USERNAME,
        u.EMAIL,
        u.NOMBRES,
        u.APELLIDOS,
        u.ESTADO,
        u.HOTEL_ID,
        u.FECHA_CREACION,
        r.NOMBRE as ROL_NOMBRE
      FROM USUARIO u
      LEFT JOIN USUARIO_ROL ur ON u.USUARIO_ID = ur.USUARIO_ID
      LEFT JOIN ROL r ON ur.ROL_ID = r.ROL_ID
      WHERE 1=1
    `;

    const binds = {};

    if (filtros.estado) {
      query += ` AND u.ESTADO = :estado`;
      binds.estado = filtros.estado;
    }

    if (filtros.rol_id) {
      query += ` AND r.ROL_ID = :rol_id`;
      binds.rol_id = filtros.rol_id;
    }

    query += ` ORDER BY u.FECHA_CREACION DESC`;

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    return result.rows.map(row => ({
      id: row.USUARIO_ID,
      username: row.USERNAME,
      nombre: row.NOMBRES,
      apellido: row.APELLIDOS,
      email: row.EMAIL,
      estado: row.ESTADO,
      hotel_id: row.HOTEL_ID,
      fecha_registro: row.FECHA_CREACION,
      rol_nombre: row.ROL_NOMBRE
    }));

  } catch (error) {
    console.error('Error en listarUsuarios:', error);
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
 * Actualizar usuario
 */
const actualizarUsuario = async (datos) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `BEGIN
         PKG_USUARIO.UPD_USUARIO(
           p_usuario_id => :usuario_id,
           p_username => :username,
           p_email => :email,
           p_nombres => :nombres,
           p_apellidos => :apellidos,
           p_usuario_modificacion => :usuario_modificacion
         );
       END;`,
      {
        usuario_id: datos.id,
        username: datos.username || null,
        email: datos.email || null,
        nombres: datos.nombre || null,
        apellidos: datos.apellido || null,
        usuario_modificacion: 'SYSTEM'
      },
      { autoCommit: true }
    );

    return true;

  } catch (error) {
    console.error('Error en actualizarUsuario:', error);
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
 * Cambiar estado de usuario
 */
const cambiarEstadoUsuario = async (id, estado) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `UPDATE USUARIO 
       SET ESTADO = :estado,
           FECHA_MODIFICACION = SYSTIMESTAMP,
           USUARIO_MODIFICACION = 'SYSTEM'
       WHERE USUARIO_ID = :id`,
      { id, estado },
      { autoCommit: true }
    );

    return true;

  } catch (error) {
    console.error('Error en cambiarEstadoUsuario:', error);
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
 * Eliminar usuario
 */
const eliminarUsuario = async (id) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `BEGIN
         PKG_USUARIO.DEL_USUARIO(p_usuario_id => :usuario_id);
       END;`,
      { usuario_id: id },
      { autoCommit: true }
    );

    return true;

  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
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
 * Cambiar contraseña
 */
const cambiarPassword = async (id, nuevaPassword) => {
  let connection;
  try {
    connection = await oracledb.getConnection();

    const passwordHash = await bcrypt.hash(nuevaPassword, 10);

    await connection.execute(
      `UPDATE USUARIO 
       SET PASSWORD_HASH = :password_hash,
           FECHA_MODIFICACION = SYSTIMESTAMP,
           USUARIO_MODIFICACION = 'SYSTEM'
       WHERE USUARIO_ID = :id`,
      { id, password_hash: passwordHash },
      { autoCommit: true }
    );

    return true;

  } catch (error) {
    console.error('Error en cambiarPassword:', error);
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
  insertarUsuario,
  loginUsuario,
  obtenerUsuarioPorId,
  listarUsuarios,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  cambiarPassword
};