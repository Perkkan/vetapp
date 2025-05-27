-- Tabla para preferencias de notificación
CREATE TABLE IF NOT EXISTS preferencias_notificacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    propietario_id INTEGER NOT NULL,
    email_recordatorio BOOLEAN DEFAULT 1,
    sms_recordatorio BOOLEAN DEFAULT 1,
    email_seguimiento BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propietario_id) REFERENCES propietarios(id)
);

-- Tabla para historial de notificaciones
CREATE TABLE IF NOT EXISTS historial_notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    propietario_id INTEGER NOT NULL,
    cita_id INTEGER,
    tipo_notificacion VARCHAR(50) NOT NULL, -- 'email', 'sms'
    tipo_mensaje VARCHAR(50) NOT NULL, -- 'recordatorio', 'seguimiento'
    estado VARCHAR(20) NOT NULL, -- 'enviado', 'fallido'
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_mensaje TEXT,
    FOREIGN KEY (propietario_id) REFERENCES propietarios(id),
    FOREIGN KEY (cita_id) REFERENCES citas(id)
);
