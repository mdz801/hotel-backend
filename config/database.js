const oracledb = require('oracledb');

// Para que Oracle devuelva objetos en vez de arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Configuración del pool usando variables de entorno
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1
};

// Inicializa el pool de conexiones
async function initDB() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✅ Pool de conexiones Oracle inicializado');
  } catch (error) {
    console.error('❌ Error inicializando pool Oracle:', error);
    process.exit(1); // Detiene la app si Oracle falla
  }
}

// Obtiene una conexión del pool
async function getConnection() {
  return await oracledb.getConnection();
}

// Cierra el pool (opcional, para apagado limpio)
async function closePool() {
  try {
    await oracledb.getPool().close(10);
    console.log('🔌 Pool Oracle cerrado');
  } catch (error) {
    console.error('Error cerrando pool Oracle:', error);
  }
}

module.exports = {
  initDB,
  getConnection,
  closePool
};
