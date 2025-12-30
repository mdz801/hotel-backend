// middleware/verificarToken.js
const { verificarToken } = require('../utils/jwtHelper');

const verificarTokenMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Acceso denegado'
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Acceso denegado'
      });
    }

    const decoded = verificarToken(token);

    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol,
      nombre: decoded.nombre
    };

    next();

  } catch (error) {
    console.error('Error al verificar token:', error.message);

    if (error.message === 'Token expirado') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado. Por favor inicie sesión nuevamente'
      });
    }

    if (error.message === 'Token inválido') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido. Acceso denegado'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Error de autenticación',
      error: error.message
    });
  }
};

module.exports = verificarTokenMiddleware;