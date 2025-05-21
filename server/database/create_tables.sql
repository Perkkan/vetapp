-- Crear tabla de clínicas
CREATE TABLE IF NOT EXISTS clinicas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    admin_id INT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    logo_url VARCHAR(255) NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (admin_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de roles y permisos
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles predefinidos
INSERT INTO roles (nombre, descripcion) VALUES
('superadmin', 'Control total sobre todas las clínicas y usuarios'),
('admin', 'Administración de una clínica específica'),
('veterinario', 'Gestión de pacientes y atención veterinaria'),
('recepcionista', 'Gestión de citas y sala de espera'),
('propietario', 'Acceso a información de sus mascotas');

-- Crear tabla de permisos
CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar permisos básicos
INSERT INTO permisos (codigo, descripcion) VALUES
('clinicas_ver', 'Ver lista de clínicas'),
('clinicas_crear', 'Crear nuevas clínicas'),
('clinicas_editar', 'Editar clínicas existentes'),
('clinicas_eliminar', 'Eliminar clínicas'),
('clinicas_acceder', 'Acceder como una clínica específica'),
('usuarios_ver', 'Ver lista de usuarios'),
('usuarios_crear', 'Crear nuevos usuarios'),
('usuarios_editar', 'Editar usuarios existentes'),
('usuarios_eliminar', 'Eliminar usuarios'),
('pacientes_ver', 'Ver lista de pacientes'),
('pacientes_crear', 'Crear nuevos pacientes'),
('pacientes_editar', 'Editar pacientes existentes'),
('pacientes_eliminar', 'Eliminar pacientes'),
('citas_ver', 'Ver lista de citas'),
('citas_crear', 'Crear nuevas citas'),
('citas_editar', 'Editar citas existentes'),
('citas_eliminar', 'Eliminar citas'),
('historiales_ver', 'Ver historiales médicos'),
('historiales_crear', 'Crear historiales médicos'),
('historiales_editar', 'Editar historiales médicos'),
('hospitalizacion_ver', 'Ver pacientes hospitalizados'),
('hospitalizacion_crear', 'Hospitalizar pacientes'),
('hospitalizacion_editar', 'Actualizar estado de hospitalización'),
('hospitalizacion_alta', 'Dar de alta a pacientes hospitalizados'),
('inventario_ver', 'Ver inventario'),
('inventario_crear', 'Añadir productos al inventario'),
('inventario_editar', 'Editar productos del inventario'),
('inventario_eliminar', 'Eliminar productos del inventario'),
('facturacion_ver', 'Ver facturas'),
('facturacion_crear', 'Crear nuevas facturas'),
('facturacion_editar', 'Editar facturas existentes'),
('facturacion_eliminar', 'Eliminar facturas'),
('sala_espera_ver', 'Ver sala de espera'),
('sala_espera_gestionar', 'Gestionar pacientes en sala de espera');

-- Crear tabla de relación roles-permisos
CREATE TABLE IF NOT EXISTS roles_permisos (
    rol_id INT NOT NULL,
    permiso_id INT NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modificar tabla de usuarios para incluir roles
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    clinica_id INT NULL,
    telefono VARCHAR(20) NULL,
    direccion TEXT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM('info', 'success', 'warning', 'error') NOT NULL DEFAULT 'info',
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura DATETIME NULL,
    relacionado_tipo VARCHAR(50) NULL,
    relacionado_id INT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar campo de clínica a la tabla de usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS clinica_id INT NULL;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuario_clinica FOREIGN KEY (clinica_id) REFERENCES clinicas(id) ON DELETE SET NULL;

-- Crear tabla de sala de espera
CREATE TABLE IF NOT EXISTS sala_espera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT NOT NULL,
    estado ENUM('espera', 'consulta', 'hospitalizado') NOT NULL DEFAULT 'espera',
    hora_llegada DATETIME NOT NULL,
    hora_inicio_consulta DATETIME NULL,
    hora_hospitalizacion DATETIME NULL,
    fecha_prevista_alta DATETIME NULL,
    motivo TEXT NULL,
    motivo_hospitalizacion TEXT NULL,
    procedimientos_realizados TEXT NULL,
    medicacion_actual TEXT NULL,
    notas_hospitalizacion TEXT NULL,
    estado_paciente TEXT NULL,
    prioridad ENUM('baja', 'normal', 'alta', 'urgente') NOT NULL DEFAULT 'normal',
    veterinario_id INT NULL,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinario_id) REFERENCES veterinarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci; 