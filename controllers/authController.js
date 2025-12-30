// controllers/authController.js
const usuarioService = require('../services/usuarioService');
const { generarToken } = require('../utils/jwtHelper');

const registrar = async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, password, rol_id } = req.body;

    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obligatorios: nombre, email, password, rol_id'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const result = await usuarioService.insertarUsuario({
      nombre: nombre.trim(),
      apellido: apellido?.trim() || null,
      email: email.trim().toLowerCase(),
      telefono: telefono?.trim() || null,
      password,
      rol_id,
      hotel_id: req.body.hotel_id || null
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: result.id,
        nombre: result.nombre,
        email: result.email
      }
    });

  } catch (error) {
    console.error('Error en registrar:', error);
    
    if (error.message.includes('email ya está registrado') || 
        error.message.includes('unique constraint')) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son obligatorios'
      });
    }

    const usuario = await usuarioService.loginUsuario(
      email.trim().toLowerCase(),
      password
    );

    console.log('Usuario encontrado:', usuario); // DEBUG

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('Estado del usuario:', usuario.estado, 'Length:', usuario.estado?.length); // DEBUG

    if (usuario.estado && usuario.estado.trim().toUpperCase() !== 'ACTIVO') {
      return res.status(403).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador'
      });
    }

    const token = generarToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol_nombre || 'USUARIO',
      nombre: usuario.nombre
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol_nombre
        },
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await usuarioService.obtenerUsuarioPorId(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol_nombre,
        estado: usuario.estado,
        fecha_registro: usuario.fecha_registro
      }
    });

  } catch (error) {
    console.error('Error en obtenerPerfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message
    });
  }
};

module.exports = {
  registrar,
  login,
  obtenerPerfil
};