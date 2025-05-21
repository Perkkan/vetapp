const { query } = require('../config/database');

const permisosController = {
    // Verificar si un usuario tiene un permiso específico
    verificarPermiso: async (req, res, next) => {
        try {
            const { usuario_id, permiso_codigo } = req.body;
            
            // Primero verificamos si el usuario es superadmin, que tiene todos los permisos
            const [usuario] = await query(
                `SELECT r.nombre as rol FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                WHERE u.id = ?`,
                [usuario_id]
            );
            
            if (!usuario || usuario.length === 0) {
                return res.status(404).json({ 
                    message: 'Usuario no encontrado',
                    tiene_permiso: false 
                });
            }
            
            // Si es superadmin, tiene todos los permisos
            if (usuario[0].rol === 'superadmin') {
                return res.json({ tiene_permiso: true });
            }
            
            // Si no es superadmin, verificamos el permiso específico
            const [resultado] = await query(
                `SELECT COUNT(*) as tiene FROM roles_permisos rp
                JOIN roles r ON rp.rol_id = r.id
                JOIN permisos p ON rp.permiso_id = p.id
                JOIN usuarios u ON u.rol_id = r.id
                WHERE u.id = ? AND p.codigo = ?`,
                [usuario_id, permiso_codigo]
            );
            
            res.json({ tiene_permiso: resultado[0].tiene > 0 });
        } catch (error) {
            console.error('Error al verificar permiso:', error);
            res.status(500).json({ 
                message: 'Error al verificar permiso',
                tiene_permiso: false 
            });
        }
    },
    
    // Obtener todos los permisos de un usuario
    getPermisosByUsuario: async (req, res) => {
        try {
            const { usuario_id } = req.params;
            
            // Obtener información del rol del usuario
            const [usuario] = await query(
                `SELECT r.id as rol_id, r.nombre as rol, u.clinica_id 
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                WHERE u.id = ?`,
                [usuario_id]
            );
            
            if (!usuario || usuario.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            // Si es superadmin, retornar todos los permisos
            if (usuario[0].rol === 'superadmin') {
                const [todosPermisos] = await query('SELECT codigo FROM permisos');
                return res.json({
                    rol: usuario[0].rol,
                    permisos: todosPermisos.map(p => p.codigo)
                });
            }
            
            // Si no es superadmin, obtener permisos específicos
            const [permisos] = await query(
                `SELECT p.codigo FROM roles_permisos rp
                JOIN permisos p ON rp.permiso_id = p.id
                WHERE rp.rol_id = ?`,
                [usuario[0].rol_id]
            );
            
            res.json({
                rol: usuario[0].rol,
                clinica_id: usuario[0].clinica_id,
                permisos: permisos.map(p => p.codigo)
            });
        } catch (error) {
            console.error('Error al obtener permisos:', error);
            res.status(500).json({ message: 'Error al obtener permisos del usuario' });
        }
    },
    
    // Middleware para verificar permisos en las rutas
    verificarPermisoMiddleware: (permiso_codigo) => {
        return async (req, res, next) => {
            try {
                // Asumimos que el ID del usuario está en req.user.id después de la autenticación
                if (!req.user || !req.user.id) {
                    return res.status(401).json({ message: 'No autorizado' });
                }
                
                const usuario_id = req.user.id;
                
                // Verificar si es superadmin
                const [usuario] = await query(
                    `SELECT r.nombre as rol FROM usuarios u
                    JOIN roles r ON u.rol_id = r.id
                    WHERE u.id = ?`,
                    [usuario_id]
                );
                
                if (!usuario || usuario.length === 0) {
                    return res.status(404).json({ message: 'Usuario no encontrado' });
                }
                
                // Si es superadmin, permitir acceso directo
                if (usuario[0].rol === 'superadmin') {
                    return next();
                }
                
                // Verificar permiso específico
                const [resultado] = await query(
                    `SELECT COUNT(*) as tiene FROM roles_permisos rp
                    JOIN roles r ON rp.rol_id = r.id
                    JOIN permisos p ON rp.permiso_id = p.id
                    JOIN usuarios u ON u.rol_id = r.id
                    WHERE u.id = ? AND p.codigo = ?`,
                    [usuario_id, permiso_codigo]
                );
                
                if (resultado[0].tiene > 0) {
                    return next();
                } else {
                    return res.status(403).json({ message: 'Acceso denegado' });
                }
            } catch (error) {
                console.error('Error en middleware de permisos:', error);
                return res.status(500).json({ message: 'Error al verificar permisos' });
            }
        };
    }
};

module.exports = permisosController; 