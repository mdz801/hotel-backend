// services/servicioAdicionalService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class ServicioAdicionalService {
  
  // Crear servicio
  async crear(data) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_hotel_id: data.hotelId,
        p_nombre: data.nombre,
        p_descripcion: data.descripcion || null,
        p_categoria: data.categoria || null,
        p_precio: data.precio,
        p_moneda: data.moneda || 'USD',
        p_unidad: data.unidad || 'SERVICIO',
        p_usuario: data.usuario || 'SYSTEM',
        p_servicio_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      };

      const result = await connection.execute(
        `BEGIN 
          PKG_SERVICIO_ADICIONAL.sp_crear_servicio(
            :p_hotel_id,
            :p_nombre,
            :p_descripcion,
            :p_categoria,
            :p_precio,
            :p_moneda,
            :p_unidad,
            :p_usuario,
            :p_servicio_id
          );
         END;`,
        binds
      );

      const servicioId = result.outBinds.p_servicio_id;
      return await this.obtenerPorId(servicioId);
      
    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Obtener servicio por ID
  async obtenerPorId(id) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_servicio_id: id,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_SERVICIO_ADICIONAL.fn_obtener_servicio_por_id(:p_servicio_id); END;`,
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
        servicioId: row[0],
        hotelId: row[1],
        nombre: row[2],
        descripcion: row[3],
        categoria: row[4],
        precio: row[5],
        moneda: row[6],
        unidad: row[7],
        estado: row[8],
        nombreHotel: row[9],
        fechaCreacion: row[10],
        usuarioCreacion: row[11],
        fechaModificacion: row[12],
        usuarioModificacion: row[13]
      };

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar todos los servicios
  async listar() {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_SERVICIO_ADICIONAL.fn_listar_servicios(); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        servicioId: row[0],
        hotelId: row[1],
        nombre: row[2],
        descripcion: row[3],
        categoria: row[4],
        precio: row[5],
        moneda: row[6],
        unidad: row[7],
        estado: row[8],
        nombreHotel: row[9],
        fechaCreacion: row[10]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar servicios por hotel
  async listarPorHotel(hotelId) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_hotel_id: hotelId,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_SERVICIO_ADICIONAL.fn_listar_por_hotel(:p_hotel_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        servicioId: row[0],
        nombre: row[1],
        descripcion: row[2],
        categoria: row[3],
        precio: row[4],
        moneda: row[5],
        unidad: row[6],
        estado: row[7],
        fechaCreacion: row[8]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar servicios activos
  async listarActivos(hotelId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_hotel_id: hotelId || null,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_SERVICIO_ADICIONAL.fn_listar_activos(:p_hotel_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        servicioId: row[0],
        hotelId: row[1],
        nombre: row[2],
        descripcion: row[3],
        categoria: row[4],
        precio: row[5],
        moneda: row[6],
        unidad: row[7],
        nombreHotel: row[8]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Listar servicios por categoría
  async listarPorCategoria(categoria, hotelId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_categoria: categoria,
        p_hotel_id: hotelId || null,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_SERVICIO_ADICIONAL.fn_listar_por_categoria(:p_categoria, :p_hotel_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        servicioId: row[0],
        hotelId: row[1],
        nombre: row[2],
        descripcion: row[3],
        precio: row[4],
        moneda: row[5],
        unidad: row[6],
        estado: row[7],
        nombreHotel: row[8]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Buscar servicios por nombre
  async buscarPorNombre(nombre, hotelId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_nombre: nombre,
        p_hotel_id: hotelId || null,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_SERVICIO_ADICIONAL.fn_buscar_por_nombre(:p_nombre, :p_hotel_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        servicioId: row[0],
        hotelId: row[1],
        nombre: row[2],
        descripcion: row[3],
        categoria: row[4],
        precio: row[5],
        moneda: row[6],
        unidad: row[7],
        estado: row[8],
        nombreHotel: row[9]
      }));

    } catch (error) {
      throw error;
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }

  // Actualizar servicio
  async actualizar(id, data) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_servicio_id: id,
        p_nombre: data.nombre || null,
        p_descripcion: data.descripcion || null,
        p_categoria: data.categoria || null,
        p_precio: data.precio || null,
        p_moneda: data.moneda || null,
        p_unidad: data.unidad || null,
        p_usuario: data.usuario || 'SYSTEM'
      };

      await connection.execute(
        `BEGIN 
          PKG_SERVICIO_ADICIONAL.sp_actualizar_servicio(
            :p_servicio_id,
            :p_nombre,
            :p_descripcion,
            :p_categoria,
            :p_precio,
            :p_moneda,
            :p_unidad,
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
        p_servicio_id: id,
        p_estado: estado,
        p_usuario: usuario
      };

      await connection.execute(
        `BEGIN PKG_SERVICIO_ADICIONAL.sp_cambiar_estado(:p_servicio_id, :p_estado, :p_usuario); END;`,
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

  // Eliminar servicio
  async eliminar(id) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_servicio_id: id
      };

      await connection.execute(
        `BEGIN PKG_SERVICIO_ADICIONAL.sp_eliminar_servicio(:p_servicio_id); END;`,
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

  // Obtener estadísticas
  async obtenerEstadisticas(hotelId = null) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const binds = {
        p_hotel_id: hotelId || null,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      };

      const result = await connection.execute(
        `BEGIN :cursor := PKG_SERVICIO_ADICIONAL.fn_obtener_estadisticas(:p_hotel_id); END;`,
        binds
      );

      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows(1000);
      await resultSet.close();

      return rows.map(row => ({
        totalServicios: row[0],
        activos: row[1],
        inactivos: row[2],
        categoriasDiferentes: row[3],
        categoria: row[4],
        cantidadPorCategoria: row[5],
        precioPromedio: row[6],
        precioMinimo: row[7],
        precioMaximo: row[8]
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

module.exports = new ServicioAdicionalService();