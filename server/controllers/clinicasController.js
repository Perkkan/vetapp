const { query, exec } = require('../config/database');

const clinicasController = {
    // Obtener todas las clínicas
    getAllClinicas: async (req, res) => {
        try {
            const [rows] = await query(`
                SELECT c.*, u.nombre as admin_nombre, u.email as admin_email 
                FROM clinicas c
                LEFT JOIN usuarios u ON c.admin_id = u.id
                ORDER BY c.nombre ASC
            `);
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener clínicas:', error);
            res.status(500).json({ message: 'Error al obtener las clínicas' });
        }
    },

    // Obtener una clínica por ID
    getClinicaById: async (req, res) => {
        const { id } = req.params;
        
        try {
            const [rows] = await query(`
                SELECT c.*, u.nombre as admin_nombre, u.email as admin_email 
                FROM clinicas c
                LEFT JOIN usuarios u ON c.admin_id = u.id
                WHERE c.id = ?
            `, [id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Clínica no encontrada' });
            }
            
            res.json(rows[0]);
        } catch (error) {
            console.error('Error al obtener la clínica:', error);
            res.status(500).json({ message: 'Error al obtener la clínica' });
        }
    },

    // Crear una nueva clínica
    createClinica: async (req, res) => {
        const { nombre, direccion, telefono, email, admin_id, logo_url } = req.body;
        
        try {
            const [result] = await exec(
                `INSERT INTO clinicas (
                    nombre, 
                    direccion, 
                    telefono, 
                    email, 
                    admin_id, 
                    logo_url
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [nombre, direccion, telefono, email, admin_id, logo_url]
            );
            
            // Si se especificó un admin_id, actualizar su clinica_id
            if (admin_id) {
                await exec(
                    'UPDATE usuarios SET clinica_id = ? WHERE id = ?',
                    [result.insertId, admin_id]
                );
            }
            
            res.status(201).json({ 
                id: result.insertId, 
                message: 'Clínica creada correctamente' 
            });
        } catch (error) {
            console.error('Error al crear la clínica:', error);
            res.status(500).json({ message: 'Error al crear la clínica' });
        }
    },

    // Actualizar una clínica existente
    updateClinica: async (req, res) => {
        const { id } = req.params;
        const { nombre, direccion, telefono, email, admin_id, logo_url, activo } = req.body;
        
        try {
            // Primero obtenemos el admin_id actual para ver si ha cambiado
            const [currentClinica] = await query(
                'SELECT admin_id FROM clinicas WHERE id = ?',
                [id]
            );
            
            if (currentClinica.length === 0) {
                return res.status(404).json({ message: 'Clínica no encontrada' });
            }
            
            // Actualizamos la clínica
            await exec(
                `UPDATE clinicas 
                SET nombre = ?, 
                    direccion = ?, 
                    telefono = ?, 
                    email = ?, 
                    admin_id = ?, 
                    logo_url = ?,
                    activo = ?
                WHERE id = ?`,
                [nombre, direccion, telefono, email, admin_id, logo_url, activo, id]
            );
            
            // Si cambió el admin_id
            if (admin_id !== currentClinica[0].admin_id) {
                // Si había un admin anterior, le quitamos la relación con esta clínica
                if (currentClinica[0].admin_id) {
                    await exec(
                        'UPDATE usuarios SET clinica_id = NULL WHERE id = ?',
                        [currentClinica[0].admin_id]
                    );
                }
                
                // Asignamos la clínica al nuevo admin
                if (admin_id) {
                    await exec(
                        'UPDATE usuarios SET clinica_id = ? WHERE id = ?',
                        [id, admin_id]
                    );
                }
            }
            
            res.json({ message: 'Clínica actualizada correctamente' });
        } catch (error) {
            console.error('Error al actualizar la clínica:', error);
            res.status(500).json({ message: 'Error al actualizar la clínica' });
        }
    },

    // Eliminar una clínica
    deleteClinica: async (req, res) => {
        const { id } = req.params;
        
        try {
            // Primero quitamos la relación con sus usuarios
            await exec(
                'UPDATE usuarios SET clinica_id = NULL WHERE clinica_id = ?',
                [id]
            );
            
            // Luego eliminamos la clínica
            await exec('DELETE FROM clinicas WHERE id = ?', [id]);
            
            res.json({ message: 'Clínica eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar la clínica:', error);
            res.status(500).json({ message: 'Error al eliminar la clínica' });
        }
    },

    // Obtener usuarios administradores disponibles (para asignar a clínicas)
    getAdministradoresDisponibles: async (req, res) => {
        try {
            const [rows] = await query(`
                SELECT id, nombre, email 
                FROM usuarios 
                WHERE rol = 'admin' AND (clinica_id IS NULL OR clinica_id = ?)
                ORDER BY nombre ASC
            `, [req.params.clinica_id || null]);
            
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener administradores disponibles:', error);
            res.status(500).json({ message: 'Error al obtener los administradores disponibles' });
        }
    },

    // Cambiar de clínica (para superadmin)
    cambiarClinicaActiva: async (req, res) => {
        const { userId, clinicaId } = req.body;
        
        try {
            // Verificamos que el usuario sea superadmin
            const [userRow] = await query(
                'SELECT rol FROM usuarios WHERE id = ?',
                [userId]
            );
            
            if (userRow.length === 0 || userRow[0].rol !== 'superadmin') {
                return res.status(403).json({ 
                    message: 'Solo los superadministradores pueden cambiar de clínica' 
                });
            }
            
            // Verificamos que la clínica exista y esté activa
            const [clinicaRow] = await query(
                'SELECT * FROM clinicas WHERE id = ? AND activo = TRUE',
                [clinicaId]
            );
            
            if (clinicaRow.length === 0) {
                return res.status(404).json({ 
                    message: 'Clínica no encontrada o inactiva' 
                });
            }
            
            // Todo ok, devolvemos la información de la clínica seleccionada
            res.json({
                message: 'Clínica seleccionada correctamente',
                clinica: clinicaRow[0]
            });
        } catch (error) {
            console.error('Error al cambiar de clínica:', error);
            res.status(500).json({ message: 'Error al cambiar de clínica' });
        }
    }
};

module.exports = clinicasController; 