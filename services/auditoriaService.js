const { dbConfig } = require('../config/database');

class AuditoriaService {
  
  async listarCambios(pagina = 1, limite = 50) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const offset = (pagina - 1) * limite;
      
      // Contar total
      const countResult = await connection.execute(
        `SELECT COUNT(*) as total FROM AUDITORIA`
      );
      const total = Number(countResult.rows[0][0]) || 0;
      
      // Obtener cambios
      const result = await connection.execute(
        `SELECT 
          ID, 
          TABLA, 
          OPERACION, 
          ID_REGISTRO, 
          USUARIO, 
          FECHA_CAMBIO,
          VALOR_ANTERIOR,
          VALOR_NUEVO,
          CAMPO_MODIFICADO
        FROM AUDITORIA
        ORDER BY FECHA_CAMBIO DESC
        OFFSET :offset ROWS FETCH NEXT :limite ROWS ONLY`,
        { offset, limite }
      );
      
      const cambios = result.rows.map(row => ({
        id: row[0],
        tabla: row[1],
        operacion: row[2],
        idRegistro: row[3],
        usuario: row[4],
        fechaCambio: row[5],
        valorAnterior: row[6],
        valorNuevo: row[7],
        campoModificado: row[8]
      }));
      
      return {
        cambios,
        paginacion: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite)
        }
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async obtenerCambio(id) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const result = await connection.execute(
        `SELECT 
          ID, 
          TABLA, 
          OPERACION, 
          ID_REGISTRO, 
          USUARIO, 
          FECHA_CAMBIO,
          VALOR_ANTERIOR,
          VALOR_NUEVO,
          CAMPO_MODIFICADO
        FROM AUDITORIA
        WHERE ID = :id`,
        { id }
      );
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row[0],
        tabla: row[1],
        operacion: row[2],
        idRegistro: row[3],
        usuario: row[4],
        fechaCambio: row[5],
        valorAnterior: row[6],
        valorNuevo: row[7],
        campoModificado: row[8]
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async cambiosPorTabla(tabla, pagina = 1, limite = 50) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const offset = (pagina - 1) * limite;
      
      // Contar total
      const countResult = await connection.execute(
        `SELECT COUNT(*) as total FROM AUDITORIA WHERE TABLA = :tabla`,
        { tabla }
      );
      const total = Number(countResult.rows[0][0]) || 0;
      
      // Obtener cambios
      const result = await connection.execute(
        `SELECT 
          ID, 
          TABLA, 
          OPERACION, 
          ID_REGISTRO, 
          USUARIO, 
          FECHA_CAMBIO,
          VALOR_ANTERIOR,
          VALOR_NUEVO,
          CAMPO_MODIFICADO
        FROM AUDITORIA
        WHERE TABLA = :tabla
        ORDER BY FECHA_CAMBIO DESC
        OFFSET :offset ROWS FETCH NEXT :limite ROWS ONLY`,
        { tabla, offset, limite }
      );
      
      const cambios = result.rows.map(row => ({
        id: row[0],
        tabla: row[1],
        operacion: row[2],
        idRegistro: row[3],
        usuario: row[4],
        fechaCambio: row[5],
        valorAnterior: row[6],
        valorNuevo: row[7],
        campoModificado: row[8]
      }));
      
      return {
        tabla,
        cambios,
        paginacion: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite)
        }
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async cambiosPorUsuario(usuarioId, pagina = 1, limite = 50) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      const offset = (pagina - 1) * limite;
      
      // Contar total
      const countResult = await connection.execute(
        `SELECT COUNT(*) as total FROM AUDITORIA WHERE USUARIO = :usuario`,
        { usuario: usuarioId }
      );
      const total = Number(countResult.rows[0][0]) || 0;
      
      // Obtener cambios
      const result = await connection.execute(
        `SELECT 
          ID, 
          TABLA, 
          OPERACION, 
          ID_REGISTRO, 
          USUARIO, 
          FECHA_CAMBIO,
          VALOR_ANTERIOR,
          VALOR_NUEVO,
          CAMPO_MODIFICADO
        FROM AUDITORIA
        WHERE USUARIO = :usuario
        ORDER BY FECHA_CAMBIO DESC
        OFFSET :offset ROWS FETCH NEXT :limite ROWS ONLY`,
        { usuario: usuarioId, offset, limite }
      );
      
      const cambios = result.rows.map(row => ({
        id: row[0],
        tabla: row[1],
        operacion: row[2],
        idRegistro: row[3],
        usuario: row[4],
        fechaCambio: row[5],
        valorAnterior: row[6],
        valorNuevo: row[7],
        campoModificado: row[8]
      }));
      
      return {
        usuario: usuarioId,
        cambios,
        paginacion: {
          pagina,
          limite,
          total,
          totalPaginas: Math.ceil(total / limite)
        }
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  async reporteConsolidado(dias = 7) {
    let connection;
    try {
      connection = await dbConfig.getConnection();
      
      // Cambios por tabla
      const tablaResult = await connection.execute(
        `SELECT TABLA, COUNT(*) as total, 
                COUNT(CASE WHEN OPERACION = 'INSERT' THEN 1 END) as inserts,
                COUNT(CASE WHEN OPERACION = 'UPDATE' THEN 1 END) as updates,
                COUNT(CASE WHEN OPERACION = 'DELETE' THEN 1 END) as deletes
         FROM AUDITORIA
         WHERE FECHA_CAMBIO >= TRUNC(SYSDATE) - :dias
         GROUP BY TABLA
         ORDER BY total DESC`,
        { dias }
      );
      
      // Cambios por usuario
      const usuarioResult = await connection.execute(
        `SELECT USUARIO, COUNT(*) as total
         FROM AUDITORIA
         WHERE FECHA_CAMBIO >= TRUNC(SYSDATE) - :dias
         GROUP BY USUARIO
         ORDER BY total DESC`,
        { dias }
      );
      
      // Operaciones totales
      const operacionResult = await connection.execute(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN OPERACION = 'INSERT' THEN 1 END) as inserts,
          COUNT(CASE WHEN OPERACION = 'UPDATE' THEN 1 END) as updates,
          COUNT(CASE WHEN OPERACION = 'DELETE' THEN 1 END) as deletes
         FROM AUDITORIA
         WHERE FECHA_CAMBIO >= TRUNC(SYSDATE) - :dias`,
        { dias }
      );
      
      const cambiosPorTabla = tablaResult.rows.map(row => ({
        tabla: row[0],
        total: Number(row[1]),
        inserts: Number(row[2]),
        updates: Number(row[3]),
        deletes: Number(row[4])
      }));
      
      const cambiosPorUsuario = usuarioResult.rows.map(row => ({
        usuario: row[0],
        total: Number(row[1])
      }));
      
      const resumenOps = operacionResult.rows[0];
      
      return {
        periodo: `Últimos ${dias} días`,
        resumen: {
          totalCambios: Number(resumenOps[0]),
          inserts: Number(resumenOps[1]),
          updates: Number(resumenOps[2]),
          deletes: Number(resumenOps[3])
        },
        cambiosPorTabla,
        cambiosPorUsuario,
        fechaGeneracion: new Date()
      };
    } finally {
      if (connection) await connection.close();
    }
  }

}

module.exports = new AuditoriaService();
