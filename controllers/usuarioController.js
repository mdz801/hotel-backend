// controllers/usuarioController.js
const usuarioService = require('../services/usuarioService');

const listarUsuarios = async (req, res) => {
  try {
    const { estado, rol_id } = req.query;

    const usuarios = await usuarioService.listarUsuarios({
      estado: estado || null,
      rol_id: rol_id ? parseInt(rol_id) : null
    });

    res.json({
      success: true,
      count: usuarios.length,
      data: usuarios
    });

  } catch (error) {
    console.error('Error en listarUsuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar usuarios',
      error: error.message
    });
  }
};

const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await usuarioService.obtenerUsuarioPorId(parseInt(id));

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (req.usuario.rol !== 'ADMIN' && req.usuario.id !== usuario.id) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permiso para ver este usuario'
      });
    }

    res.json({
      success: true,
      data: usuario
    });

  } catch (error) {
    console.error('Error en obtenerUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message
    });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (req.usuario.rol !== 'ADMIN' && req.usuario.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tiene permiso para actualizar este usuario'
      });
    }

    const { nombre, apellido, telefono, email } = req.body;

    await usuarioService.actualizarUsuario({
      id: userId,
      nombre: nombre?.trim() || null,
      apellido: apellido?.trim() || null,
      telefono: telefono?.trim() || null,
      email: email?.trim().toLowerCase() || null
    });

    const usuarioActualizado = await usuarioService.obtenerUsuarioPorId(userId);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });

  } catch (error) {
    console.error('Error en actualizarUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message
    });
  }
};

const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['A', 'I'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Use "A" (Activo) o "I" (Inactivo)'
      });
    }

    if (req.usuario.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'No puede cambiar su propio estado'
      });
    }

    await usuarioService.cambiarEstadoUsuario(parseInt(id), estado);

    res.json({
      success: true,
      message: `Usuario ${estado === 'A' ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error en cambiarEstadoUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado',
      error: error.message
    });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.usuario.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'No puede eliminar su propio usuario'
      });
    }

    await usuarioService.eliminarUsuario(parseInt(id));

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message
    });
  }
};

const cambiarPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    // ========== DEBUG COMPLETO ==========
    console.log('========================================');
    console.log('🔍 DEBUG CAMBIAR PASSWORD');
    console.log('========================================');
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('req.body type:', typeof req.body);
    console.log('req.body es null?:', req.body === null);
    console.log('req.body es undefined?:', req.body === undefined);
    console.log('Content-Type header:', req.headers['content-type']);
    console.log('req.usuario:', req.usuario);
    console.log('params.id:', id);
    console.log('========================================');
    // =====================================
    
    // Verificar que req.body existe
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Body de la petición vacío o inválido',
        debug: {
          bodyType: typeof req.body,
          bodyValue: req.body,
          contentType: req.headers['content-type'],
          mensaje: 'Verifica que en Postman esté seleccionado Body > raw > JSON'
        }
      });
    }

    const { password_actual, password_nueva } = req.body;

    // Verificar permisos
    if (req.usuario.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puede cambiar su propia contraseña'
      });
    }

    // Validar campos requeridos
    if (!password_actual || !password_nueva) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar password_actual y password_nueva',
        debug: {
          password_actual_recibido: password_actual ? 'SÍ' : 'NO',
          password_nueva_recibido: password_nueva ? 'SÍ' : 'NO',
          body_completo: req.body,
          mensaje: 'Verifica que los nombres de campos sean exactamente: password_actual y password_nueva'
        }
      });
    }

    // Validar longitud
    if (password_nueva.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar contraseña actual
    const usuario = await usuarioService.obtenerUsuarioPorId(userId);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const loginValido = await usuarioService.loginUsuario(usuario.email, password_actual);

    if (!loginValido) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Cambiar contraseña
    await usuarioService.cambiarPassword(userId, password_nueva);

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en cambiarPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message
    });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  cambiarPassword
};