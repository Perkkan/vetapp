-- Insertar datos de prueba en la sala de espera
INSERT INTO sala_espera (paciente_id, estado, hora_llegada, motivo, prioridad)
VALUES 
    (1, 'espera', DATE_SUB(NOW(), INTERVAL 3 MINUTE), 'Revisión rutinaria', 'normal'),
    (2, 'espera', DATE_SUB(NOW(), INTERVAL 8 MINUTE), 'Vacunación', 'normal'),
    (3, 'espera', DATE_SUB(NOW(), INTERVAL 12 MINUTE), 'Vómitos y diarrea', 'alta');

-- Pacientes en consulta
INSERT INTO sala_espera (paciente_id, estado, hora_llegada, hora_inicio_consulta, motivo, veterinario_id)
VALUES 
    (4, 'consulta', DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE), 'Fractura en pata', 1);

-- Pacientes hospitalizados
INSERT INTO sala_espera (paciente_id, estado, hora_llegada, hora_inicio_consulta, hora_hospitalizacion, motivo, motivo_hospitalizacion, veterinario_id)
VALUES 
    (5, 'hospitalizado', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Envenenamiento', 'Observación por envenenamiento con pesticidas', 2);

-- Insertar datos de prueba para usuarios
INSERT INTO usuarios (nombre, email, password, rol) VALUES 
('Superadmin', 'superadmin@vetapp.com', '$2a$10$bYtSpE986VZqZN4B7yQQS.HV0xUFE2BsZ1gbX0IR4yUQgKpHGdG3C', 'superadmin'),
('Admin Central', 'admin@vetapp.com', '$2a$10$bYtSpE986VZqZN4B7yQQS.HV0xUFE2BsZ1gbX0IR4yUQgKpHGdG3C', 'admin'),
('Admin Sucursal Norte', 'admin.norte@vetapp.com', '$2a$10$bYtSpE986VZqZN4B7yQQS.HV0xUFE2BsZ1gbX0IR4yUQgKpHGdG3C', 'admin'),
('Admin Sucursal Sur', 'admin.sur@vetapp.com', '$2a$10$bYtSpE986VZqZN4B7yQQS.HV0xUFE2BsZ1gbX0IR4yUQgKpHGdG3C', 'admin'),
('Veterinario', 'vet@vetapp.com', '$2a$10$bYtSpE986VZqZN4B7yQQS.HV0xUFE2BsZ1gbX0IR4yUQgKpHGdG3C', 'veterinario'),
('Recepcionista', 'recepcion@vetapp.com', '$2a$10$bYtSpE986VZqZN4B7yQQS.HV0xUFE2BsZ1gbX0IR4yUQgKpHGdG3C', 'recepcionista');

-- Insertar datos de prueba para clínicas
INSERT INTO clinicas (nombre, direccion, telefono, email, admin_id, logo_url, activo) VALUES 
('Clínica Veterinaria Central', 'Av. Principal 123, Ciudad', '555-123-4567', 'central@vetapp.com', 2, 'https://example.com/logo-central.png', true),
('Sucursal Norte', 'Calle Norte 456, Zona Norte', '555-987-6543', 'norte@vetapp.com', 3, 'https://example.com/logo-norte.png', true),
('Sucursal Sur', 'Av. Sur 789, Zona Sur', '555-567-8901', 'sur@vetapp.com', 4, 'https://example.com/logo-sur.png', true);

-- Actualizar usuarios administradores con su clínica asignada
UPDATE usuarios SET clinica_id = 1 WHERE id = 2;
UPDATE usuarios SET clinica_id = 2 WHERE id = 3;
UPDATE usuarios SET clinica_id = 3 WHERE id = 4;

-- Insertar datos de propietarios
INSERT INTO propietarios (nombre, email, telefono, direccion)
VALUES 
    ('Juan Pérez', 'juan@example.com', '555-123-4567', 'Calle 123, Ciudad'),
    ('María Gómez', 'maria@example.com', '555-987-6543', 'Calle 456, Zona Norte'),
    ('Carlos Rodríguez', 'carlos@example.com', '555-567-8901', 'Av. Sur 789, Zona Sur'); 