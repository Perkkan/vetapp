const jwt = require('jsonwebtoken');

// Middleware para verificar token de autenticación
exports.verifyToken = (req, res, next) => {
  try {
    // Obtener token del encabezado Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acceso no autorizado. Token no proporcionado' });
    }
    
    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expirado' });
        }
        
        return res.status(401).json({ message: 'Token inválido' });
      }
      
      // Guardar datos del usuario en el objeto de solicitud
      req.user = {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol,
        clinicaId: decoded.clinicaId
      };
      
      next();
    });
  } catch (error) {
    console.error('Error en verificación de token:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Middleware para verificar roles específicos
exports.hasRole = (roles) => {
  return (req, res, next) => {
    try {
      // Verificar si el usuario está autenticado
      if (!req.user) {
        return res.status(401).json({ message: 'Acceso no autorizado' });
      }
      
      // Superadmin tiene acceso a todo
      if (req.user.rol === 'superadmin') {
        return next();
      }
      
      // Verificar si el rol del usuario está en la lista de roles permitidos
      if (Array.isArray(roles)) {
        if (roles.includes(req.user.rol)) {
          return next();
        }
      } else if (req.user.rol === roles) {
        return next();
      }
      
      // Si no tiene el rol adecuado
      res.status(403).json({ message: 'Acceso denegado. No tienes los permisos necesarios' });
    } catch (error) {
      console.error('Error en verificación de roles:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };
};

// Middleware para verificar permisos específicos
exports.hasPermiso = (permisos) => {
  return async (req, res, next) => {
    try {
      const db = require('../database/db');
      
      // Verificar si el usuario está autenticado
      if (!req.user) {
        return res.status(401).json({ message: 'Acceso no autorizado' });
      }
      
      // Superadmin tiene todos los permisos
      if (req.user.rol === 'superadmin') {
        return next();
      }
      
      // Convertir a array si es un solo permiso
      const permisosRequeridos = Array.isArray(permisos) ? permisos : [permisos];
      
      // Obtener permisos del usuario según su rol
      const permisosQuery = `
        SELECT p.nombre
        FROM permisos p
        JOIN roles_permisos rp ON p.id = rp.permiso_id
        JOIN roles r ON rp.rol_id = r.id
        WHERE r.nombre = ?
      `;
      
      const [permisosUsuario] = await db.query(permisosQuery, [req.user.rol]);
      const permisosArray = permisosUsuario.map(p => p.nombre);
      
      // Verificar si el usuario tiene alguno de los permisos requeridos
      const tienePermiso = permisosRequeridos.some(permiso => permisosArray.includes(permiso));
      
      if (tienePermiso) {
        return next();
      }
      
      // Si no tiene los permisos adecuados
      res.status(403).json({ message: 'Acceso denegado. No tienes los permisos necesarios' });
    } catch (error) {
      console.error('Error en verificación de permisos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };
};

// Middleware para restricciones por clínica
exports.sameClinica = (req, res, next) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({ message: 'Acceso no autorizado' });
    }
    
    // Superadmin puede acceder a todas las clínicas
    if (req.user.rol === 'superadmin') {
      return next();
    }
    
    // Para otros roles, verificar que la clínica del recurso coincida con la del usuario
    const clinicaIdRecurso = req.params.clinicaId || req.body.clinicaId;
    
    if (!clinicaIdRecurso) {
      // Si no hay ID de clínica en la solicitud, asumir que es para la clínica del usuario
      return next();
    }
    
    // Convertir a número para comparación consistente
    const clinicaIdUsuario = parseInt(req.user.clinicaId);
    const clinicaIdSolicitada = parseInt(clinicaIdRecurso);
    
    if (clinicaIdUsuario === clinicaIdSolicitada) {
      return next();
    }
    
    // Si no coincide la clínica
    res.status(403).json({ message: 'Acceso denegado. No puedes acceder a recursos de otra clínica' });
  } catch (error) {
    console.error('Error en verificación de clínica:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}; 