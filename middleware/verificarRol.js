// middleware/verificarRol.js

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      if (!req.usuario.rol) {
        return res.status(403).json({
          success: false,
          message: 'Usuario sin rol asignado'
        });
      }

      const rolesNormalizados = rolesPermitidos.map(r => r.toUpperCase());
      const rolUsuario = req.usuario.rol.toUpperCase();

      if (!rolesNormalizados.includes(rolUsuario)) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos suficientes para realizar esta acción',
          requiere: rolesPermitidos,
          rol_actual: req.usuario.rol
        });
      }

      next();

    } catch (error) {
      console.error('Error en verificarRol:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: error.message
      });
    }
  };
};

const soloAdmin = verificarRol('ADMIN');
const soloRecepcionista = verificarRol('RECEPCIONISTA');
const recepcionistaOAdmin = verificarRol('ADMIN', 'RECEPCIONISTA');
const soloPersonal = verificarRol('ADMIN', 'RECEPCIONISTA');
const cualquierRol = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }
  next();
};

module.exports = {
  verificarRol,
  soloAdmin,
  soloRecepcionista,
  recepcionistaOAdmin,
  soloPersonal,
  cualquierRol
};