const oracledb = require('oracledb');

// DEBUG OBLIGATORIO (temporal)
console.log('DB_CONNECTION_STRING =>', process.env.DB_CONNECTION_STRING);

oracledb.outFormat = oracledb.OUT_FORMAT_ARRAY;

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING, // 👈 ESTA LÍNEA ES CLAVE
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1
};

async function initDB() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✅ Pool Oracle inicializado');
  } catch (error) {
    console.error('❌ Error Oracle:', error);
    throw error;
  }
}

async function getConnection() {
  return await oracledb.getConnection(); // usa el pool
}

module.exports = {
  initDB,
  getConnection
};
