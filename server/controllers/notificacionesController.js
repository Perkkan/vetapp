const { query, exec } = require('../config/database');

const notificacionesController = {
    // Obtener notificaciones de un usuario
    getNotificacionesByUsuario: async (req, res) => {
        try {
            const { usuario_id } = req.params;
            const { page = 1, limit = 10, incluir_leidas = false } = req.query;
            
            const offset = (page - 1) * limit;
            
            let sqlWhere = 'WHERE usuario_id = ?';
            let params = [usuario_id];
            
            // Si no se solicitan notificaciones leídas, filtrar solo las no leídas
            if (!incluir_leidas || incluir_leidas === 'false') {
                sqlWhere += ' AND leida = 0';
            }
            
            // Obtener las notificaciones
            const [notificaciones] = await query(
                `SELECT id, titulo, mensaje, tipo, leida, fecha_creacion, fecha_lectura, 
                 relacionado_tipo, relacionado_id
                 FROM notificaciones
                 ${sqlWhere}
                 ORDER BY fecha_creacion DESC
                 LIMIT ? OFFSET ?`,
                [...params, parseInt(limit), offset]
            );
            
            // Obtener el total de notificaciones para la paginación
            const [countResult] = await query(
                `SELECT COUNT(*) as total FROM notificaciones ${sqlWhere}`,
                params
            );
            
            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);
            
            res.json({
                data: notificaciones,
                pagination: {
                    totalItems,
                    totalPages,
                    currentPage: parseInt(page),
                    itemsPerPage: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Error al obtener notificaciones:', error);
            res.status(500).json({ message: 'Error al obtener notificaciones' });
        }
    },
    
    // Marcar una notificación como leída
    marcarComoLeida: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar que la notificación existe
            const [notificacion] = await query(
                'SELECT id FROM notificaciones WHERE id = ?',
                [id]
            );
            
            if (!notificacion || notificacion.length === 0) {
                return res.status(404).json({ message: 'Notificación no encontrada' });
            }
            
            // Actualizar la notificación
            await query(
                'UPDATE notificaciones SET leida = 1, fecha_lectura = NOW() WHERE id = ?',
                [id]
            );
            
            res.json({ message: 'Notificación marcada como leída' });
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
            res.status(500).json({ message: 'Error al marcar notificación como leída' });
        }
    },
    
    // Marcar todas las notificaciones de un usuario como leídas
    marcarTodasComoLeidas: async (req, res) => {
        try {
            const { usuario_id } = req.params;
            
            // Actualizar todas las notificaciones del usuario
            await query(
                'UPDATE notificaciones SET leida = 1, fecha_lectura = NOW() WHERE usuario_id = ? AND leida = 0',
                [usuario_id]
            );
            
            res.json({ message: 'Todas las notificaciones marcadas como leídas' });
        } catch (error) {
            console.error('Error al marcar todas las notificaciones como leídas:', error);
            res.status(500).json({ message: 'Error al marcar todas las notificaciones como leídas' });
        }
    },
    
    // Eliminar una notificación
    eliminarNotificacion: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar que la notificación existe
            const [notificacion] = await query(
                'SELECT id FROM notificaciones WHERE id = ?',
                [id]
            );
            
            if (!notificacion || notificacion.length === 0) {
                return res.status(404).json({ message: 'Notificación no encontrada' });
            }
            
            // Eliminar la notificación
            await query(
                'DELETE FROM notificaciones WHERE id = ?',
                [id]
            );
            
            res.json({ message: 'Notificación eliminada' });
        } catch (error) {
            console.error('Error al eliminar notificación:', error);
            res.status(500).json({ message: 'Error al eliminar notificación' });
        }
    },
    
    // Crear una nueva notificación para un usuario
    crearNotificacion: async (usuario_id, titulo, mensaje, tipo = 'info', relacionado_tipo = null, relacionado_id = null) => {
        try {
            await query(
                `INSERT INTO notificaciones (
                    usuario_id, titulo, mensaje, tipo, 
                    relacionado_tipo, relacionado_id, fecha_creacion
                ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [usuario_id, titulo, mensaje, tipo, relacionado_tipo, relacionado_id]
            );
            
            return true;
        } catch (error) {
            console.error('Error al crear notificación:', error);
            return false;
        }
    },
    
    // Enviar notificación a todos los administradores de una clínica
    notificarAdministradores: async (data) => {
        try {
            const { clinica_id, titulo, mensaje, tipo, relacionado_tipo, relacionado_id } = data;
            
            // Obtener todos los administradores de la clínica
            const [admins] = await query(
                `SELECT id FROM usuarios 
                WHERE rol_id = (SELECT id FROM roles WHERE nombre = 'admin') 
                AND clinica_id = ?`,
                [clinica_id]
            );
            
            // Enviar notificación a cada administrador
            for (const admin of admins) {
                await notificacionesController.crearNotificacion(
                    admin.id, 
                    titulo, 
                    mensaje, 
                    tipo, 
                    relacionado_tipo, 
                    relacionado_id
                );
            }
            
            return true;
        } catch (error) {
            console.error('Error al notificar administradores:', error);
            return false;
        }
    },
    
    // Enviar notificación al propietario de un paciente
    notificarPropietario: async (data) => {
        try {
            const { paciente_id, titulo, mensaje, tipo, relacionado_tipo, relacionado_id } = data;
            
            // Obtener el propietario del paciente
            const [propietario] = await query(
                `SELECT pr.usuario_id 
                FROM pacientes p 
                JOIN propietarios pr ON p.propietario_id = pr.id 
                WHERE p.id = ?`,
                [paciente_id]
            );
            
            if (!propietario || propietario.length === 0 || !propietario[0].usuario_id) {
                return false;
            }
            
            // Enviar notificación al propietario
            await notificacionesController.crearNotificacion(
                propietario[0].usuario_id,
                titulo,
                mensaje,
                tipo,
                relacionado_tipo,
                relacionado_id
            );
            
            return true;
        } catch (error) {
            console.error('Error al notificar propietario:', error);
            return false;
        }
    }
};

module.exports = notificacionesController; 