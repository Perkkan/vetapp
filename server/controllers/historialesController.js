const { query, exec } = require('../config/database');

const historialesController = {
    // Obtener todos los historiales
    getAllHistoriales: async (req, res) => {
        try {
            const [rows] = await query(`
                SELECT h.*, p.nombre as paciente_nombre, 
                       COALESCE(v.nombre, 'No asignado') as veterinario_nombre
                FROM historiales h
                LEFT JOIN pacientes p ON h.paciente_id = p.id
                LEFT JOIN veterinarios v ON h.veterinario_id = v.id
                ORDER BY h.fecha DESC
            `);
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener historiales:', error);
            res.status(500).json({ message: 'Error al obtener los historiales' });
        }
    },

    // Obtener un historial por ID
    getHistorialById: async (req, res) => {
        try {
            const [rows] = await query(`
                SELECT h.*, p.nombre as paciente_nombre, 
                       COALESCE(v.nombre, 'No asignado') as veterinario_nombre
                FROM historiales h
                LEFT JOIN pacientes p ON h.paciente_id = p.id
                LEFT JOIN veterinarios v ON h.veterinario_id = v.id
                WHERE h.id = ?
            `, [req.params.id]);
            
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Historial no encontrado' });
            }
            
            res.json(rows[0]);
        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({ message: 'Error al obtener el historial' });
        }
    },

    // Obtener historiales por paciente
    getHistorialesByPaciente: async (req, res) => {
        try {
            const [rows] = await query(`
                SELECT h.*, p.nombre as paciente_nombre, 
                       COALESCE(v.nombre, 'No asignado') as veterinario_nombre
                FROM historiales h
                LEFT JOIN pacientes p ON h.paciente_id = p.id
                LEFT JOIN veterinarios v ON h.veterinario_id = v.id
                WHERE h.paciente_id = ?
                ORDER BY h.fecha DESC
            `, [req.params.pacienteId]);
            
            res.json(rows);
        } catch (error) {
            console.error('Error al obtener historiales del paciente:', error);
            res.status(500).json({ message: 'Error al obtener los historiales del paciente' });
        }
    },

    // Crear un nuevo historial
    createHistorial: async (req, res) => {
        const { 
            paciente_id, 
            fecha, 
            diagnostico, 
            tratamiento, 
            observaciones, 
            veterinario_id 
        } = req.body;
        
        try {
            const [result] = await exec(
                `INSERT INTO historiales (
                    paciente_id, 
                    fecha, 
                    diagnostico, 
                    tratamiento, 
                    observaciones, 
                    veterinario_id
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    paciente_id, 
                    fecha || new Date().toISOString().split('T')[0], 
                    diagnostico, 
                    tratamiento, 
                    observaciones, 
                    veterinario_id || null
                ]
            );
            
            res.status(201).json({ 
                id: result.insertId, 
                message: 'Historial creado exitosamente' 
            });
        } catch (error) {
            console.error('Error al crear historial:', error);
            res.status(500).json({ message: 'Error al crear el historial' });
        }
    },

    // Actualizar un historial
    updateHistorial: async (req, res) => {
        const { 
            paciente_id, 
            fecha, 
            diagnostico, 
            tratamiento, 
            observaciones, 
            veterinario_id 
        } = req.body;
        
        try {
            await exec(
                `UPDATE historiales 
                SET paciente_id = ?, 
                    fecha = ?, 
                    diagnostico = ?, 
                    tratamiento = ?, 
                    observaciones = ?, 
                    veterinario_id = ? 
                WHERE id = ?`,
                [
                    paciente_id, 
                    fecha, 
                    diagnostico, 
                    tratamiento, 
                    observaciones, 
                    veterinario_id, 
                    req.params.id
                ]
            );
            
            res.json({ message: 'Historial actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar historial:', error);
            res.status(500).json({ message: 'Error al actualizar el historial' });
        }
    },

    // Eliminar un historial
    deleteHistorial: async (req, res) => {
        try {
            await exec('DELETE FROM historiales WHERE id = ?', [req.params.id]);
            res.json({ message: 'Historial eliminado exitosamente' });
        } catch (error) {
            console.error('Error al eliminar historial:', error);
            res.status(500).json({ message: 'Error al eliminar el historial' });
        }
    }
};

module.exports = historialesController; 