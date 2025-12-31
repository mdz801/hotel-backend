// services/reservaService.js
const oracledb = require('oracledb');
const dbConfig = require('../config/database');

class ReservaService {
  
  /**
   
   * 
   * @param {Object} data - Datos de la reserva
   * @returns {Object} Reserva creada con detalles
   */
  async crearReserva(data) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      // ========================================
      // 1. EXTRAER Y VALIDAR DATOS
      // ========================================
      const {
        codigoReserva = null,  // Si viene null, el trigger lo genera
        hotelId,
        huespedId,
        fechaCheckin,
        fechaCheckout,
        numeroAdultos,
        numeroNinos = 0,
        subtotal,
        descuento = 0,
        impuestos,
        total,
        moneda = 'USD',
        politicaCancelacionId = null,
        observaciones = null,
        usuarioCreacion,
        habitaciones = []  // Array: [{ habitacionId, tarifaAplicada }]
      } = data;
      
      // Validar campos requeridos
      if (!hotelId || !huespedId || !fechaCheckin || !fechaCheckout) {
        throw new Error('Faltan campos requeridos: hotelId, huespedId, fechaCheckin, fechaCheckout');
      }
      
      if (!numeroAdultos || numeroAdultos < 1) {
        throw new Error('Debe haber al menos 1 adulto');
      }
      
      if (habitaciones.length === 0) {
        throw new Error('Debe seleccionar al menos una habitación');
      }
      
      // Validar fechas
      const checkin = new Date(fechaCheckin);
      const checkout = new Date(fechaCheckout);
      
      if (checkout <= checkin) {
        throw new Error('La fecha de checkout debe ser posterior al checkin');
      }
      
      // Calcular número de noches
      const noches = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
      
      // ========================================
      // 2. CREAR LA RESERVA PRINCIPAL
      // ========================================
      const reservaResult = await connection.execute(
        `BEGIN
          PKG_RESERVA.INS_RESERVA(
            :codigoReserva,
            :hotelId,
            :huespedId,
            TO_DATE(:fechaCheckin, 'YYYY-MM-DD'),
            TO_DATE(:fechaCheckout, 'YYYY-MM-DD'),
            :numeroAdultos,
            :numeroNinos,
            :subtotal,
            :descuento,
            :impuestos,
            :total,
            :moneda,
            :politicaCancelacionId,
            :observaciones,
            :usuarioCreacion,
            :reservaId
          );
        END;`,
        {
          codigoReserva,
          hotelId,
          huespedId,
          fechaCheckin,
          fechaCheckout,
          numeroAdultos,
          numeroNinos,
          subtotal,
          descuento,
          impuestos,
          total,
          moneda,
          politicaCancelacionId,
          observaciones,
          usuarioCreacion,
          reservaId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: false }  // NO hacer commit todavía
      );
      
      const reservaId = reservaResult.outBinds.reservaId;
      
      console.log(`✅ Reserva creada con ID: ${reservaId}`);
      
     
      const detallesCreados = [];
      
      for (const hab of habitaciones) {
        const detalleSubtotal = hab.tarifaAplicada * noches;
        
        const detalleResult = await connection.execute(
          `BEGIN
            PKG_RESERVA.INS_DETALLE_RESERVA(
              :reservaId,
              :habitacionId,
              :tarifaAplicada,
              :noches,
              :subtotal,
              :usuarioCreacion,
              :detalleId
            );
          END;`,
          {
            reservaId,
            habitacionId: hab.habitacionId,
            tarifaAplicada: hab.tarifaAplicada,
            noches,
            subtotal: detalleSubtotal,
            usuarioCreacion,
            detalleId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: false }
        );
        
        detallesCreados.push({
          detalleId: detalleResult.outBinds.detalleId,
          habitacionId: hab.habitacionId,
          tarifaAplicada: hab.tarifaAplicada,
          numeroNoches: noches,
          subtotal: detalleSubtotal
        });
        
        console.log(`✅ Habitación ${hab.habitacionId} agregada`);
      }
      
      // ========================================
      // 4. HACER COMMIT Y RETORNAR RESERVA
      // ========================================
      await connection.commit();
      console.log('✅ Transacción confirmada');
      
      // Obtener la reserva completa con todos los datos
      const reservaCompleta = await this.obtenerPorId(reservaId);
      
      return {
        success: true,
        data: reservaCompleta,
        message: 'Reserva creada exitosamente'
      };
      
    } catch (error) {
      // Si algo falla, deshacer cambios
      if (connection) {
        await connection.rollback();
        console.error('❌ Rollback ejecutado');
      }
      
      console.error('Error al crear reserva:', error.message);
      throw error;
      
    } finally {
      // Siempre cerrar la conexión
      if (connection) {
        await connection.close();
      }
    }
  }
  
  /**
   * OBTENER RESERVA POR ID 
   */
  async obtenerPorId(id) {
    let connection;
    
    try {
      connection = await dbConfig.getConnection();
      
      // Obtener reserva principal
      const result = await connection.execute(
        `SELECT 
          R.RESERVA_ID,
          R.CODIGO_RESERVA,
          R.HOTEL_ID,
          R.HUESPED_ID,
          TO_CHAR(R.FECHA_CHECKIN, 'YYYY-MM-DD') AS FECHA_CHECKIN,
          TO_CHAR(R.FECHA_CHECKOUT, 'YYYY-MM-DD') AS FECHA_CHECKOUT,
          R.NUMERO_ADULTOS,
          R.NUMERO_NINOS,
          R.NUMERO_NOCHES,
          R.ESTADO,
          R.SUBTOTAL,
          R.DESCUENTO,
          R.IMPUESTOS,
          R.TOTAL,
          R.MONEDA,
          R.POLITICA_CANCELACION_ID,
          R.OBSERVACIONES,
          TO_CHAR(R.FECHA_CONFIRMACION, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_CONFIRMACION,
          TO_CHAR(R.FECHA_CHECKIN_REAL, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_CHECKIN_REAL,
          TO_CHAR(R.FECHA_CHECKOUT_REAL, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_CHECKOUT_REAL,
          TO_CHAR(R.FECHA_CANCELACION, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_CANCELACION,
          R.MOTIVO_CANCELACION,
          H.NOMBRE AS HOTEL_NOMBRE,
          HU.NOMBRES || ' ' || HU.APELLIDOS AS HUESPED_NOMBRE,
          HU.EMAIL AS HUESPED_EMAIL,
          PC.NOMBRE AS POLITICA_NOMBRE,
          TO_CHAR(R.FECHA_CREACION, 'YYYY-MM-DD HH24:MI:SS') AS FECHA_CREACION
        FROM RESERVA R
        INNER JOIN HOTEL H ON R.HOTEL_ID = H.HOTEL_ID
        INNER JOIN HUESPED HU ON R.HUESPED_ID = HU.HUESPED_ID
        LEFT JOIN POLITICA_CANCELACION PC ON R.POLITICA_CANCELACION_ID = PC.POLITICA_ID
        WHERE R.RESERVA_ID = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const reserva = result.rows[0];
      
      // Obtener habitaciones de la reserva
      const detallesResult = await connection.execute(
        `SELECT 
          DR.DETALLE_ID,
          DR.HABITACION_ID,
          DR.TARIFA_APLICADA,
          DR.NUMERO_NOCHES,
          DR.SUBTOTAL,
          H.NUMERO_HABITACION,
          H.PISO,
          H.VISTA,
          TH.NOMBRE AS TIPO_HABITACION,
          TH.CAPACIDAD_ADULTOS,
          TH.CAPACIDAD_NINOS
        FROM DETALLE_RESERVA DR
        INNER JOIN HABITACION H ON DR.HABITACION_ID = H.HABITACION_ID
        INNER JOIN TIPO_HABITACION TH ON H.TIPO_HABITACION_ID = TH.TIPO_HABITACION_ID
        WHERE DR.RESERVA_ID = :id
        ORDER BY DR.DETALLE_ID`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      // Agregar habitaciones a la reserva
      reserva.HABITACIONES = detallesResult.rows;
      
      return reserva;
      
    } finally {
      if (connection) {
        await connection.close();
      }
    }
  }
  
}

module.exports = new ReservaService();
