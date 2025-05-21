const { query } = require('../config/database');

const propietariosController = {
    // Obtener todos los propietarios
    getAllPropietarios: async (req, res) => {
        try {
            const { clinica_id, limit = 100, offset = 0, search = '' } = req.query;
            
            let sqlWhere = '';
            let params = [];
            
            if (clinica_id) {
                sqlWhere = 'WHERE clinica_id = ?';
                params.push(clinica_id);
                
                if (search) {
                    sqlWhere += ' AND (nombre LIKE ? OR email LIKE ? OR telefono LIKE ? OR nif LIKE ?)';
                    const searchTerm = `%${search}%`;
                    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
                }
            } else if (search) {
                sqlWhere = 'WHERE nombre LIKE ? OR email LIKE ? OR telefono LIKE ? OR nif LIKE ?';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            const [propietarios] = await query(
                `SELECT * FROM propietarios
                ${sqlWhere}
                ORDER BY nombre
                LIMIT ? OFFSET ?`,
                [...params, parseInt(limit), parseInt(offset)]
            );
            
            // Contar total de registros para paginación
            const [countResult] = await query(
                `SELECT COUNT(*) as total FROM propietarios ${sqlWhere}`,
                params
            );
            
            res.json({
                data: propietarios,
                pagination: {
                    total: countResult[0].total,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            console.error('Error al obtener propietarios:', error);
            res.status(500).json({ message: 'Error al obtener propietarios' });
        }
    },
    
    // Obtener un propietario por ID
    getPropietarioById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const [propietarios] = await query(
                'SELECT * FROM propietarios WHERE id = ?',
                [id]
            );
            
            if (!propietarios || propietarios.length === 0) {
                return res.status(404).json({ message: 'Propietario no encontrado' });
            }
            
            // Obtener pacientes del propietario
            const [pacientes] = await query(
                'SELECT id, nombre, especie, raza FROM pacientes WHERE propietario_id = ? AND activo = true',
                [id]
            );
            
            const propietario = propietarios[0];
            propietario.pacientes = pacientes;
            
            res.json(propietario);
        } catch (error) {
            console.error('Error al obtener propietario:', error);
            res.status(500).json({ message: 'Error al obtener propietario' });
        }
    },
    
    // Crear un nuevo propietario
    createPropietario: async (req, res) => {
        try {
            const { 
                nombre, email, telefono, direccion, 
                nif, notas, clinica_id, usuario_id = null 
            } = req.body;
            
            // Verificar si ya existe un propietario con el mismo NIF o email
            if (nif || email) {
                const [existente] = await query(
                    'SELECT id FROM propietarios WHERE (nif = ? AND nif IS NOT NULL) OR (email = ? AND email IS NOT NULL)',
                    [nif, email]
                );
                
                if (existente && existente.length > 0) {
                    return res.status(400).json({ 
                        message: 'Ya existe un propietario con ese NIF o email' 
                    });
                }
            }
            
            // Insertar propietario
            const [result] = await query(
                `INSERT INTO propietarios (
                    nombre, email, telefono, direccion, 
                    nif, notas, clinica_id, usuario_id,
                    fecha_registro, activo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), true)`,
                [
                    nombre, email, telefono, direccion, 
                    nif, notas, clinica_id, usuario_id
                ]
            );
            
            res.status(201).json({
                id: result.insertId,
                message: 'Propietario creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear propietario:', error);
            res.status(500).json({ message: 'Error al crear propietario' });
        }
    },
    
    // Actualizar un propietario existente
    updatePropietario: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                nombre, email, telefono, direccion, 
                nif, notas, usuario_id, activo 
            } = req.body;
            
            // Verificar que el propietario existe
            const [propietarioExists] = await query(
                'SELECT id FROM propietarios WHERE id = ?',
                [id]
            );
            
            if (!propietarioExists || propietarioExists.length === 0) {
                return res.status(404).json({ message: 'Propietario no encontrado' });
            }
            
            // Verificar si ya existe otro propietario con el mismo NIF o email
            if (nif || email) {
                const [existente] = await query(
                    'SELECT id FROM propietarios WHERE ((nif = ? AND nif IS NOT NULL) OR (email = ? AND email IS NOT NULL)) AND id != ?',
                    [nif, email, id]
                );
                
                if (existente && existente.length > 0) {
                    return res.status(400).json({ 
                        message: 'Ya existe otro propietario con ese NIF o email' 
                    });
                }
            }
            
            // Actualizar propietario
            await query(
                `UPDATE propietarios SET
                    nombre = ?,
                    email = ?,
                    telefono = ?,
                    direccion = ?,
                    nif = ?,
                    notas = ?,
                    usuario_id = ?,
                    activo = ?
                WHERE id = ?`,
                [
                    nombre, email, telefono, direccion,
                    nif, notas, usuario_id, activo ? 1 : 0,
                    id
                ]
            );
            
            res.json({ message: 'Propietario actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar propietario:', error);
            res.status(500).json({ message: 'Error al actualizar propietario' });
        }
    },
    
    // Eliminar un propietario
    deletePropietario: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar que el propietario existe
            const [propietarioExists] = await query(
                'SELECT id FROM propietarios WHERE id = ?',
                [id]
            );
            
            if (!propietarioExists || propietarioExists.length === 0) {
                return res.status(404).json({ message: 'Propietario no encontrado' });
            }
            
            // Verificar si el propietario tiene pacientes
            const [pacientes] = await query(
                'SELECT COUNT(*) as count FROM pacientes WHERE propietario_id = ?',
                [id]
            );
            
            if (pacientes[0].count > 0) {
                // Si tiene pacientes, marcar como inactivo en lugar de eliminar
                await query(
                    'UPDATE propietarios SET activo = false WHERE id = ?',
                    [id]
                );
                
                return res.json({ 
                    message: 'Propietario marcado como inactivo (tiene pacientes asociados)' 
                });
            }
            
            // Si no tiene pacientes, eliminar completamente
            await query('DELETE FROM propietarios WHERE id = ?', [id]);
            
            res.json({ message: 'Propietario eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar propietario:', error);
            res.status(500).json({ message: 'Error al eliminar propietario' });
        }
    }
};

module.exports = propietariosController; 