const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { sendEmailPasswordRecovery } = require('../utils/emailService');
const crypto = require('crypto');

// Generar token JWT
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    rol: user.rol,
    clinicaId: user.clinica_id
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// Controlador para inicio de sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos de entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Buscar usuario por email
    const userQuery = `
      SELECT u.id, u.nombre, u.email, u.password, u.rol, u.clinica_id
      FROM usuarios u
      WHERE u.email = ? AND u.activo = 1
    `;
    
    const [users] = await query(userQuery, [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Obtener permisos del usuario
    const permisosQuery = `
      SELECT p.nombre
      FROM permisos p
      JOIN roles_permisos rp ON p.id = rp.permiso_id
      JOIN roles r ON rp.rol_id = r.id
      WHERE r.nombre = ?
    `;
    
    const [permisos] = await query(permisosQuery, [user.rol]);
    const permisosArray = permisos.map(p => p.nombre);

    // Generar token JWT
    const token = generateToken(user);

    // Registrar el inicio de sesión
    await query(
      'INSERT INTO logs_acceso (usuario_id, accion, ip) VALUES (?, ?, ?)', 
      [user.id, 'login', req.ip]
    );

    // Enviar respuesta
    res.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      clinicaId: user.clinica_id,
      permisos: permisosArray,
      token: token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para registro de usuarios (solo admins pueden crear usuarios)
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, rol, clinicaId } = req.body;
    const userReq = req.user; // Usuario que hace la solicitud

    // Validar que solo admin o superadmin pueden registrar usuarios
    if (userReq.rol !== 'admin' && userReq.rol !== 'superadmin') {
      return res.status(403).json({ message: 'No tienes permisos para registrar usuarios' });
    }

    // Validar que clinicaId coincida con el del admin (excepto para superadmin)
    if (userReq.rol === 'admin' && userReq.clinicaId !== clinicaId) {
      return res.status(403).json({ message: 'Solo puedes crear usuarios para tu clínica' });
    }

    // Verificar que el rol sea válido
    const rolesPermitidos = ['admin', 'veterinario', 'recepcion', 'propietario'];
    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Superadmin solo puede ser creado por otro superadmin
    if (rol === 'superadmin' && userReq.rol !== 'superadmin') {
      return res.status(403).json({ message: 'No tienes permisos para crear usuarios superadmin' });
    }

    // Verificar si el email ya existe
    const [existingUsers] = await query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insertar usuario en la base de datos
    const [result] = await query(
      'INSERT INTO usuarios (nombre, email, password, rol, clinica_id, creado_por) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol, clinicaId, userReq.id]
    );

    // Registrar la acción
    await query(
      'INSERT INTO logs_acceso (usuario_id, accion, detalles) VALUES (?, ?, ?)', 
      [userReq.id, 'crear_usuario', `Creó usuario ${email} con rol ${rol}`]
    );

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para validar token
exports.validateToken = (req, res) => {
  // Si ha llegado hasta aquí, el token es válido (gracias al middleware verifyToken)
  res.json({ valid: true, user: req.user });
};

// Controlador para obtener permisos del usuario actual
exports.getUserPermisos = async (req, res) => {
  try {
    const userId = req.user.id;

    // Si es superadmin, tiene todos los permisos
    if (req.user.rol === 'superadmin') {
      const [allPermisos] = await query('SELECT nombre FROM permisos');
      const permisosArray = allPermisos.map(p => p.nombre);
      return res.json(permisosArray);
    }

    // Para otros roles, obtener permisos específicos
    const permisosQuery = `
      SELECT p.nombre
      FROM permisos p
      JOIN roles_permisos rp ON p.id = rp.permiso_id
      JOIN roles r ON rp.rol_id = r.id
      WHERE r.nombre = ?
    `;
    
    const [permisos] = await query(permisosQuery, [req.user.rol]);
    const permisosArray = permisos.map(p => p.nombre);

    res.json(permisosArray);

  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Obtener datos del usuario
    const [users] = await query('SELECT password FROM usuarios WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña
    await query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, userId]);

    // Registrar cambio de contraseña en logs
    await query(
      'INSERT INTO logs_acceso (usuario_id, accion) VALUES (?, ?)', 
      [userId, 'cambio_password']
    );

    res.json({ message: 'Contraseña actualizada con éxito' });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para solicitar restablecimiento de contraseña
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el usuario existe
    const [users] = await query('SELECT id, nombre FROM usuarios WHERE email = ? AND activo = 1', [email]);
    
    if (users.length === 0) {
      // No revelar si el usuario existe o no por razones de seguridad
      return res.json({ message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' });
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1); // Token válido por 1 hora

    // Guardar token en la base de datos
    await query(
      'INSERT INTO password_reset_tokens (usuario_id, token, expiracion) VALUES (?, ?, ?)',
      [users[0].id, resetToken, expiration]
    );

    // Enviar email con instrucciones
    await sendEmailPasswordRecovery(email, users[0].nombre, resetToken);

    res.json({ message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña' });

  } catch (error) {
    console.error('Error al solicitar reset de contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para restablecer contraseña con token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verificar si el token existe y no ha expirado
    const [tokens] = await query(
      'SELECT usuario_id, expiracion FROM password_reset_tokens WHERE token = ? AND usado = 0',
      [token]
    );
    
    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Token inválido o ya utilizado' });
    }

    const { usuario_id, expiracion } = tokens[0];
    
    // Verificar si el token ha expirado
    if (new Date() > new Date(expiracion)) {
      return res.status(400).json({ message: 'El token ha expirado' });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar contraseña del usuario
    await query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, usuario_id]);

    // Marcar token como usado
    await query('UPDATE password_reset_tokens SET usado = 1 WHERE token = ?', [token]);

    // Registrar cambio de contraseña en logs
    await query(
      'INSERT INTO logs_acceso (usuario_id, accion, detalles) VALUES (?, ?, ?)', 
      [usuario_id, 'reset_password', 'Restablecimiento por token']
    );

    res.json({ message: 'Contraseña restablecida con éxito' });

  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}; 