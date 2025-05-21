const { query } = require('../config/database');

const pacientesController = {
    // Obtener todos los pacientes
    getAllPacientes: async (req, res) => {
        try {
            const { clinica_id, limit = 100, offset = 0, search = '' } = req.query;
            
            let sqlWhere = '';
            let params = [];
            
            if (clinica_id) {
                sqlWhere = 'WHERE p.clinica_id = ?';
                params.push(clinica_id);
                
                if (search) {
                    sqlWhere += ' AND (p.nombre LIKE ? OR p.especie LIKE ? OR p.raza LIKE ? OR pr.nombre LIKE ?)';
                    const searchTerm = `%${search}%`;
                    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
                }
            } else if (search) {
                sqlWhere = 'WHERE p.nombre LIKE ? OR p.especie LIKE ? OR p.raza LIKE ? OR pr.nombre LIKE ?';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }
            
            const [pacientes] = await query(
                `SELECT p.*, pr.nombre as propietario_nombre, pr.telefono as propietario_telefono,
                pr.email as propietario_email, pr.direccion as propietario_direccion
                FROM pacientes p
                JOIN propietarios pr ON p.propietario_id = pr.id
                ${sqlWhere}
                ORDER BY p.nombre
                LIMIT ? OFFSET ?`,
                [...params, parseInt(limit), parseInt(offset)]
            );
            
            // Contar total de registros para paginación
            const [countResult] = await query(
                `SELECT COUNT(*) as total 
                FROM pacientes p
                JOIN propietarios pr ON p.propietario_id = pr.id
                ${sqlWhere}`,
                params
            );
            
            res.json({
                data: pacientes,
                pagination: {
                    total: countResult[0].total,
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                }
            });
        } catch (error) {
            console.error('Error al obtener pacientes:', error);
            res.status(500).json({ message: 'Error al obtener pacientes' });
        }
    },
    
    // Obtener un paciente por ID
    getPacienteById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const [pacientes] = await query(
                `SELECT p.*, pr.id as propietario_id, pr.nombre as propietario_nombre, 
                pr.telefono as propietario_telefono, pr.email as propietario_email,
                pr.direccion as propietario_direccion
                FROM pacientes p
                JOIN propietarios pr ON p.propietario_id = pr.id
                WHERE p.id = ?`,
                [id]
            );
            
            if (!pacientes || pacientes.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }
            
            res.json(pacientes[0]);
        } catch (error) {
            console.error('Error al obtener paciente:', error);
            res.status(500).json({ message: 'Error al obtener paciente' });
        }
    },
    
    // Crear un nuevo paciente
    createPaciente: async (req, res) => {
        try {
            const { 
                nombre, especie, raza, fecha_nacimiento, sexo, 
                propietario_id, peso, color, esterilizado, 
                alergias, enfermedades_previas, clinica_id 
            } = req.body;
            
            // Verificar que el propietario existe
            const [propietarioExists] = await query(
                'SELECT id FROM propietarios WHERE id = ?',
                [propietario_id]
            );
            
            if (!propietarioExists || propietarioExists.length === 0) {
                return res.status(404).json({ message: 'Propietario no encontrado' });
            }
            
            // Insertar paciente
            const [result] = await query(
                `INSERT INTO pacientes (
                    nombre, especie, raza, fecha_nacimiento, sexo, 
                    propietario_id, peso, color, esterilizado, 
                    alergias, enfermedades_previas, clinica_id,
                    fecha_registro, activo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), true)`,
                [
                    nombre, especie, raza, fecha_nacimiento, sexo, 
                    propietario_id, peso, color, esterilizado ? 1 : 0, 
                    alergias, enfermedades_previas, clinica_id
                ]
            );
            
            res.status(201).json({
                id: result.insertId,
                message: 'Paciente creado exitosamente'
            });
        } catch (error) {
            console.error('Error al crear paciente:', error);
            res.status(500).json({ message: 'Error al crear paciente' });
        }
    },
    
    // Actualizar un paciente existente
    updatePaciente: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                nombre, especie, raza, fecha_nacimiento, sexo, 
                propietario_id, peso, color, esterilizado, 
                alergias, enfermedades_previas, activo
            } = req.body;
            
            // Verificar que el paciente existe
            const [pacienteExists] = await query(
                'SELECT id FROM pacientes WHERE id = ?',
                [id]
            );
            
            if (!pacienteExists || pacienteExists.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }
            
            // Verificar que el propietario existe si se está cambiando
            if (propietario_id) {
                const [propietarioExists] = await query(
                    'SELECT id FROM propietarios WHERE id = ?',
                    [propietario_id]
                );
                
                if (!propietarioExists || propietarioExists.length === 0) {
                    return res.status(404).json({ message: 'Propietario no encontrado' });
                }
            }
            
            // Actualizar paciente
            await query(
                `UPDATE pacientes SET
                    nombre = ?,
                    especie = ?,
                    raza = ?,
                    fecha_nacimiento = ?,
                    sexo = ?,
                    propietario_id = ?,
                    peso = ?,
                    color = ?,
                    esterilizado = ?,
                    alergias = ?,
                    enfermedades_previas = ?,
                    activo = ?
                WHERE id = ?`,
                [
                    nombre, especie, raza, fecha_nacimiento, sexo,
                    propietario_id, peso, color, esterilizado ? 1 : 0,
                    alergias, enfermedades_previas, activo ? 1 : 0,
                    id
                ]
            );
            
            res.json({ message: 'Paciente actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar paciente:', error);
            res.status(500).json({ message: 'Error al actualizar paciente' });
        }
    },
    
    // Eliminar un paciente
    deletePaciente: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar que el paciente existe
            const [pacienteExists] = await query(
                'SELECT id FROM pacientes WHERE id = ?',
                [id]
            );
            
            if (!pacienteExists || pacienteExists.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }
            
            // Verificar si el paciente tiene historiales o citas
            const [historiales] = await query(
                'SELECT COUNT(*) as count FROM historiales WHERE paciente_id = ?',
                [id]
            );
            
            const [citas] = await query(
                'SELECT COUNT(*) as count FROM citas WHERE paciente_id = ?',
                [id]
            );
            
            if (historiales[0].count > 0 || citas[0].count > 0) {
                // Si tiene registros relacionados, marcar como inactivo en lugar de eliminar
                await query(
                    'UPDATE pacientes SET activo = false WHERE id = ?',
                    [id]
                );
                
                return res.json({ 
                    message: 'Paciente marcado como inactivo (tiene historiales o citas asociadas)'
                });
            }
            
            // Si no tiene registros relacionados, eliminar completamente
            await query('DELETE FROM pacientes WHERE id = ?', [id]);
            
            res.json({ message: 'Paciente eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar paciente:', error);
            res.status(500).json({ message: 'Error al eliminar paciente' });
        }
    },
    
    // Obtener pacientes por propietario
    getPacientesByPropietario: async (req, res) => {
        try {
            const { propietarioId } = req.params;
            
            // Verificar que el propietario existe
            const [propietarioExists] = await query(
                'SELECT id FROM propietarios WHERE id = ?',
                [propietarioId]
            );
            
            if (!propietarioExists || propietarioExists.length === 0) {
                return res.status(404).json({ message: 'Propietario no encontrado' });
            }
            
            // Obtener pacientes del propietario
            const [pacientes] = await query(
                `SELECT * FROM pacientes 
                WHERE propietario_id = ? AND activo = true
                ORDER BY nombre`,
                [propietarioId]
            );
            
            res.json(pacientes);
        } catch (error) {
            console.error('Error al obtener pacientes por propietario:', error);
            res.status(500).json({ message: 'Error al obtener pacientes por propietario' });
        }
    }
};

module.exports = pacientesController; 