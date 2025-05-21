const { query, exec } = require('../config/database');
const bcrypt = require('bcryptjs');
const notificacionesController = require('./notificacionesController');

const usuariosController = {
    // Obtener todos los usuarios
    getAllUsuarios: async (req, res) => {
        try {
            const { clinica_id } = req.query;
            
            let whereClause = '';
            let params = [];
            
            if (clinica_id) {
                whereClause = 'WHERE u.clinica_id = ?';
                params.push(clinica_id);
            }
            
            const [rows] = await query(`
                SELECT u.id, u.nombre, u.email, r.nombre as rol, u.clinica_id, 
                       c.nombre as clinica_nombre, u.activo, u.fecha_registro, u.ultimo_login
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                LEFT JOIN clinicas c ON u.clinica_id = c.id
                ${whereClause}
                ORDER BY u.nombre ASC
            `, params);
            
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({ message: 'Error al obtener los usuarios' });
        }
    },
    
    // Obtener un usuario por ID
    getUsuarioById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const [rows] = await query(`
                SELECT u.id, u.nombre, u.email, u.rol_id, r.nombre as rol, 
                       u.clinica_id, c.nombre as clinica_nombre, u.telefono, 
                       u.direccion, u.activo, u.fecha_registro, u.ultimo_login
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                LEFT JOIN clinicas c ON u.clinica_id = c.id
                WHERE u.id = ?
            `, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            res.json(rows[0]);
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            res.status(500).json({ message: 'Error al obtener el usuario' });
        }
    },
    
    // Crear un nuevo usuario
    createUsuario: async (req, res) => {
        try {
            const { 
                nombre, 
                email, 
                password, 
                rol_id, 
                clinica_id, 
                telefono,
                direccion 
            } = req.body;
            
            // Verificar si el email ya existe
            const [existeEmail] = await query('SELECT id FROM usuarios WHERE email = ?', [email]);
            
            if (existeEmail.length > 0) {
                return res.status(400).json({ message: 'El email ya está registrado' });
            }
            
            // Hashear la contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            
            // Insertar el nuevo usuario
            const [result] = await exec(
                `INSERT INTO usuarios (
                    nombre, email, password, rol_id, clinica_id, telefono, direccion
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [nombre, email, hashedPassword, rol_id, clinica_id, telefono, direccion]
            );
            
            // Notificar a los administradores de la clínica si corresponde
            if (clinica_id) {
                const [rol] = await query('SELECT nombre FROM roles WHERE id = ?', [rol_id]);
                
                await notificacionesController.notificarAdministradores({
                    clinica_id,
                    titulo: 'Nuevo usuario registrado',
                    mensaje: `Se ha registrado un nuevo usuario (${rol[0].nombre}): ${nombre}`,
                    tipo: 'info',
                    relacionado_tipo: 'usuario',
                    relacionado_id: result.insertId
                });
            }
            
            res.status(201).json({
                id: result.insertId,
                message: 'Usuario creado correctamente'
            });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({ message: 'Error al crear el usuario' });
        }
    },
    
    // Actualizar un usuario existente
    updateUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                nombre, 
                email, 
                password, 
                rol_id, 
                clinica_id, 
                telefono,
                direccion,
                activo 
            } = req.body;
            
            // Verificar si el usuario existe
            const [existeUsuario] = await query(
                'SELECT clinica_id FROM usuarios WHERE id = ?', 
                [id]
            );
            
            if (existeUsuario.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            // Si se cambia el email, verificar que no exista
            if (email) {
                const [existeEmail] = await query(
                    'SELECT id FROM usuarios WHERE email = ? AND id != ?', 
                    [email, id]
                );
                
                if (existeEmail.length > 0) {
                    return res.status(400).json({ message: 'El email ya está registrado' });
                }
            }
            
            // Construir la consulta dinámicamente
            let updateQuery = 'UPDATE usuarios SET ';
            const updateParams = [];
            
            if (nombre) {
                updateQuery += 'nombre = ?, ';
                updateParams.push(nombre);
            }
            
            if (email) {
                updateQuery += 'email = ?, ';
                updateParams.push(email);
            }
            
            if (password) {
                // Hashear la nueva contraseña
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                
                updateQuery += 'password = ?, ';
                updateParams.push(hashedPassword);
            }
            
            if (rol_id) {
                updateQuery += 'rol_id = ?, ';
                updateParams.push(rol_id);
            }
            
            if (clinica_id !== undefined) {
                updateQuery += 'clinica_id = ?, ';
                updateParams.push(clinica_id);
            }
            
            if (telefono !== undefined) {
                updateQuery += 'telefono = ?, ';
                updateParams.push(telefono);
            }
            
            if (direccion !== undefined) {
                updateQuery += 'direccion = ?, ';
                updateParams.push(direccion);
            }
            
            if (activo !== undefined) {
                updateQuery += 'activo = ?, ';
                updateParams.push(activo);
            }
            
            // Eliminar la última coma y espacio
            updateQuery = updateQuery.slice(0, -2);
            
            // Agregar la condición WHERE
            updateQuery += ' WHERE id = ?';
            updateParams.push(id);
            
            // Ejecutar la actualización
            await exec(updateQuery, updateParams);
            
            // Notificar el cambio si cambió la clínica
            const clinicaAnterior = existeUsuario[0].clinica_id;
            if (clinica_id !== undefined && clinica_id !== clinicaAnterior && clinica_id !== null) {
                await notificacionesController.notificarAdministradores({
                    clinica_id,
                    titulo: 'Usuario asignado a tu clínica',
                    mensaje: `El usuario ${nombre || email} ha sido asignado a tu clínica`,
                    tipo: 'info',
                    relacionado_tipo: 'usuario',
                    relacionado_id: id
                });
            }
            
            res.json({ message: 'Usuario actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ message: 'Error al actualizar el usuario' });
        }
    },
    
    // Eliminar un usuario
    deleteUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar si el usuario existe
            const [usuario] = await query(
                'SELECT nombre, email, clinica_id FROM usuarios WHERE id = ?', 
                [id]
            );
            
            if (usuario.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            // Eliminar el usuario
            await exec('DELETE FROM usuarios WHERE id = ?', [id]);
            
            // Notificar a los administradores si el usuario pertenecía a una clínica
            if (usuario[0].clinica_id) {
                await notificacionesController.notificarAdministradores({
                    clinica_id: usuario[0].clinica_id,
                    titulo: 'Usuario eliminado',
                    mensaje: `El usuario ${usuario[0].nombre} (${usuario[0].email}) ha sido eliminado`,
                    tipo: 'warning',
                    relacionado_tipo: 'usuario',
                    relacionado_id: id
                });
            }
            
            res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({ message: 'Error al eliminar el usuario' });
        }
    },
    
    // Actualizar el registro de último acceso
    actualizarUltimoLogin: async (userId) => {
        try {
            await exec(
                'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
                [userId]
            );
            return true;
        } catch (error) {
            console.error('Error al actualizar último login:', error);
            return false;
        }
    },
    
    // Obtener usuarios por rol
    getUsuariosByRol: async (req, res) => {
        try {
            const { rol, clinica_id } = req.query;
            
            let whereClause = 'WHERE r.nombre = ?';
            let params = [rol];
            
            if (clinica_id) {
                whereClause += ' AND u.clinica_id = ?';
                params.push(clinica_id);
            }
            
            const [rows] = await query(`
                SELECT u.id, u.nombre, u.email, u.clinica_id, c.nombre as clinica_nombre
                FROM usuarios u
                JOIN roles r ON u.rol_id = r.id
                LEFT JOIN clinicas c ON u.clinica_id = c.id
                ${whereClause}
                ORDER BY u.nombre ASC
            `, params);
            
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener usuarios por rol:', error);
            res.status(500).json({ message: 'Error al obtener los usuarios' });
        }
    },
    
    // Cambiar contraseña del usuario
    cambiarPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { password_actual, password_nueva } = req.body;
            
            // Verificar si el usuario existe y obtener su contraseña actual
            const [usuario] = await query('SELECT password FROM usuarios WHERE id = ?', [id]);
            
            if (usuario.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }
            
            // Verificar que la contraseña actual sea correcta
            const passwordCorrecta = await bcrypt.compare(password_actual, usuario[0].password);
            
            if (!passwordCorrecta) {
                return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
            }
            
            // Hashear la nueva contraseña
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password_nueva, salt);
            
            // Actualizar la contraseña
            await exec(
                'UPDATE usuarios SET password = ? WHERE id = ?',
                [hashedPassword, id]
            );
            
            res.json({ message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            res.status(500).json({ message: 'Error al cambiar la contraseña' });
        }
    }
};

module.exports = usuariosController; 