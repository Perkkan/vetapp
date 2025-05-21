const { query, exec } = require('../config/database');
const notificacionesController = require('./notificacionesController');

const salaEsperaController = {
    // Obtener pacientes en espera
    getPacientesEnEspera: async (req, res) => {
        try {
            const [pacientes] = await query(
                `SELECT se.id, se.hora_llegada, se.motivo, se.prioridad, 
                p.id as paciente_id, p.nombre as paciente_nombre, p.especie, p.raza, p.edad, 
                pr.id as propietario_id, pr.nombre as propietario_nombre, pr.telefono as propietario_telefono
                FROM sala_espera se
                JOIN pacientes p ON se.paciente_id = p.id
                JOIN propietarios pr ON p.propietario_id = pr.id
                WHERE se.estado = 'espera'
                ORDER BY 
                    CASE se.prioridad 
                        WHEN 'urgente' THEN 1 
                        WHEN 'alta' THEN 2 
                        WHEN 'normal' THEN 3 
                        WHEN 'baja' THEN 4 
                    END, 
                    se.hora_llegada ASC`
            );
            
            res.json(pacientes);
        } catch (error) {
            console.error('Error al obtener pacientes en espera:', error);
            res.status(500).json({ message: 'Error al obtener pacientes en espera' });
        }
    },
    
    // Obtener pacientes en consulta
    getPacientesEnConsulta: async (req, res) => {
        try {
            const [pacientes] = await query(
                `SELECT se.id, se.hora_llegada, se.hora_inicio_consulta, se.motivo, 
                p.id as paciente_id, p.nombre as paciente_nombre, p.especie, p.raza, p.edad,
                v.id as veterinario_id, v.nombre as veterinario_nombre
                FROM sala_espera se
                JOIN pacientes p ON se.paciente_id = p.id
                LEFT JOIN veterinarios v ON se.veterinario_id = v.id
                WHERE se.estado = 'consulta'
                ORDER BY se.hora_inicio_consulta ASC`
            );
            
            res.json(pacientes);
        } catch (error) {
            console.error('Error al obtener pacientes en consulta:', error);
            res.status(500).json({ message: 'Error al obtener pacientes en consulta' });
        }
    },
    
    // Obtener pacientes hospitalizados
    getPacientesHospitalizados: async (req, res) => {
        try {
            const [pacientes] = await query(
                `SELECT se.id, se.hora_llegada, se.hora_hospitalizacion, se.fecha_prevista_alta, 
                se.motivo_hospitalizacion, se.estado_paciente,
                p.id as paciente_id, p.nombre as paciente_nombre, p.especie, p.raza, p.edad,
                v.id as veterinario_id, v.nombre as veterinario_nombre
                FROM sala_espera se
                JOIN pacientes p ON se.paciente_id = p.id
                LEFT JOIN veterinarios v ON se.veterinario_id = v.id
                WHERE se.estado = 'hospitalizado'
                ORDER BY se.hora_hospitalizacion ASC`
            );
            
            res.json(pacientes);
        } catch (error) {
            console.error('Error al obtener pacientes hospitalizados:', error);
            res.status(500).json({ message: 'Error al obtener pacientes hospitalizados' });
        }
    },
    
    // Obtener detalle de un paciente hospitalizado
    getDetalleHospitalizacion: async (req, res) => {
        try {
            const { id } = req.params;
            
            const [detalle] = await query(
                `SELECT se.id, se.paciente_id, se.hora_llegada, se.hora_hospitalizacion, 
                se.fecha_prevista_alta, se.motivo, se.motivo_hospitalizacion, 
                se.procedimientos_realizados, se.medicacion_actual, se.notas_hospitalizacion, 
                se.estado_paciente,
                p.nombre as paciente_nombre, p.especie, p.raza, p.edad, p.sexo, p.peso,
                pr.id as propietario_id, pr.nombre as propietario_nombre, pr.telefono as propietario_telefono,
                v.id as veterinario_id, v.nombre as veterinario_nombre
                FROM sala_espera se
                JOIN pacientes p ON se.paciente_id = p.id
                JOIN propietarios pr ON p.propietario_id = pr.id
                LEFT JOIN veterinarios v ON se.veterinario_id = v.id
                WHERE se.id = ? AND se.estado = 'hospitalizado'`,
                [id]
            );
            
            if (!detalle || detalle.length === 0) {
                return res.status(404).json({ message: 'Paciente hospitalizado no encontrado' });
            }
            
            res.json(detalle[0]);
        } catch (error) {
            console.error('Error al obtener detalle de hospitalización:', error);
            res.status(500).json({ message: 'Error al obtener detalle de hospitalización' });
        }
    },
    
    // Agregar paciente a sala de espera
    agregarPacienteEspera: async (req, res) => {
        try {
            const { paciente_id, motivo, prioridad = 'normal' } = req.body;
            
            // Verificar que el paciente existe
            const [pacienteExistente] = await query(
                'SELECT id FROM pacientes WHERE id = ?',
                [paciente_id]
            );
            
            if (!pacienteExistente || pacienteExistente.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado' });
            }
            
            // Verificar que el paciente no esté ya en la sala de espera
            const [pacienteEnEspera] = await query(
                'SELECT id FROM sala_espera WHERE paciente_id = ? AND (estado = "espera" OR estado = "consulta")',
                [paciente_id]
            );
            
            if (pacienteEnEspera && pacienteEnEspera.length > 0) {
                return res.status(400).json({ message: 'El paciente ya está en sala de espera o en consulta' });
            }
            
            // Agregar paciente a sala de espera
            const [resultado] = await query(
                `INSERT INTO sala_espera (paciente_id, estado, hora_llegada, motivo, prioridad)
                VALUES (?, 'espera', NOW(), ?, ?)`,
                [paciente_id, motivo, prioridad]
            );
            
            res.status(201).json({
                id: resultado.insertId,
                paciente_id,
                estado: 'espera',
                hora_llegada: new Date(),
                motivo,
                prioridad
            });
        } catch (error) {
            console.error('Error al agregar paciente a sala de espera:', error);
            res.status(500).json({ message: 'Error al agregar paciente a sala de espera' });
        }
    },
    
    // Mover paciente a consulta
    moverAConsulta: async (req, res) => {
        try {
            const { id } = req.params;
            const { veterinario_id } = req.body;
            
            // Verificar que el paciente está en espera
            const [pacienteEspera] = await query(
                'SELECT id, paciente_id FROM sala_espera WHERE id = ? AND estado = "espera"',
                [id]
            );
            
            if (!pacienteEspera || pacienteEspera.length === 0) {
                return res.status(404).json({ message: 'Paciente en espera no encontrado' });
            }
            
            // Mover a consulta
            await query(
                `UPDATE sala_espera 
                SET estado = 'consulta', hora_inicio_consulta = NOW(), veterinario_id = ?
                WHERE id = ?`,
                [veterinario_id, id]
            );
            
            res.json({ message: 'Paciente movido a consulta exitosamente' });
        } catch (error) {
            console.error('Error al mover paciente a consulta:', error);
            res.status(500).json({ message: 'Error al mover paciente a consulta' });
        }
    },
    
    // Mover paciente a hospitalización
    moverAHospitalizacion: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                motivo_hospitalizacion, 
                procedimientos_realizados, 
                medicacion_actual, 
                notas_hospitalizacion, 
                estado_paciente,
                fecha_prevista_alta
            } = req.body;
            
            // Verificar que el paciente está en consulta
            const [pacienteConsulta] = await query(
                'SELECT id, paciente_id, veterinario_id FROM sala_espera WHERE id = ? AND estado = "consulta"',
                [id]
            );
            
            if (!pacienteConsulta || pacienteConsulta.length === 0) {
                return res.status(404).json({ message: 'Paciente en consulta no encontrado' });
            }
            
            // Mover a hospitalización
            await query(
                `UPDATE sala_espera 
                SET estado = 'hospitalizado', 
                    hora_hospitalizacion = NOW(), 
                    motivo_hospitalizacion = ?, 
                    procedimientos_realizados = ?, 
                    medicacion_actual = ?, 
                    notas_hospitalizacion = ?, 
                    estado_paciente = ?,
                    fecha_prevista_alta = ?
                WHERE id = ?`,
                [
                    motivo_hospitalizacion, 
                    procedimientos_realizados, 
                    medicacion_actual, 
                    notas_hospitalizacion, 
                    estado_paciente,
                    fecha_prevista_alta,
                    id
                ]
            );
            
            res.json({ message: 'Paciente hospitalizado exitosamente' });
        } catch (error) {
            console.error('Error al hospitalizar paciente:', error);
            res.status(500).json({ message: 'Error al hospitalizar paciente' });
        }
    },
    
    // Actualizar información de hospitalización
    actualizarHospitalizacion: async (req, res) => {
        try {
            const { id } = req.params;
            const { 
                procedimientos_realizados, 
                medicacion_actual, 
                notas_hospitalizacion, 
                estado_paciente,
                fecha_prevista_alta
            } = req.body;
            
            // Verificar que el paciente está hospitalizado
            const [pacienteHospitalizado] = await query(
                'SELECT id FROM sala_espera WHERE id = ? AND estado = "hospitalizado"',
                [id]
            );
            
            if (!pacienteHospitalizado || pacienteHospitalizado.length === 0) {
                return res.status(404).json({ message: 'Paciente hospitalizado no encontrado' });
            }
            
            // Actualizar información
            await query(
                `UPDATE sala_espera 
                SET procedimientos_realizados = ?, 
                    medicacion_actual = ?, 
                    notas_hospitalizacion = ?, 
                    estado_paciente = ?,
                    fecha_prevista_alta = ?
                WHERE id = ?`,
                [
                    procedimientos_realizados, 
                    medicacion_actual, 
                    notas_hospitalizacion, 
                    estado_paciente,
                    fecha_prevista_alta,
                    id
                ]
            );
            
            res.json({ message: 'Información de hospitalización actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar información de hospitalización:', error);
            res.status(500).json({ message: 'Error al actualizar información de hospitalización' });
        }
    },
    
    // Actualizar prioridad de un paciente en espera
    actualizarPrioridad: async (req, res) => {
        try {
            const { id } = req.params;
            const { prioridad } = req.body;
            
            if (!['baja', 'normal', 'alta', 'urgente'].includes(prioridad)) {
                return res.status(400).json({ message: 'Prioridad no válida' });
            }
            
            // Verificar que el paciente está en espera
            const [pacienteEspera] = await query(
                'SELECT id FROM sala_espera WHERE id = ? AND estado = "espera"',
                [id]
            );
            
            if (!pacienteEspera || pacienteEspera.length === 0) {
                return res.status(404).json({ message: 'Paciente en espera no encontrado' });
            }
            
            // Actualizar prioridad
            await query(
                'UPDATE sala_espera SET prioridad = ? WHERE id = ?',
                [prioridad, id]
            );
            
            res.json({ message: 'Prioridad actualizada exitosamente' });
        } catch (error) {
            console.error('Error al actualizar prioridad:', error);
            res.status(500).json({ message: 'Error al actualizar prioridad' });
        }
    },
    
    // Finalizar atención (dar de alta)
    finalizarAtencion: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar que el paciente existe en sala de espera
            const [paciente] = await query(
                'SELECT id, estado FROM sala_espera WHERE id = ?',
                [id]
            );
            
            if (!paciente || paciente.length === 0) {
                return res.status(404).json({ message: 'Paciente no encontrado en sala de espera' });
            }
            
            // Eliminar registro de sala de espera
            await query(
                'DELETE FROM sala_espera WHERE id = ?',
                [id]
            );
            
            res.json({ message: 'Atención finalizada exitosamente' });
        } catch (error) {
            console.error('Error al finalizar atención:', error);
            res.status(500).json({ message: 'Error al finalizar atención' });
        }
    }
};

module.exports = salaEsperaController; 