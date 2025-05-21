-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS veterinaria_db;
USE veterinaria_db;

-- Tabla de propietarios
CREATE TABLE IF NOT EXISTS propietarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    nif VARCHAR(20) UNIQUE,
    estado ENUM('Activo', 'Inactivo', 'Pendiente') DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notas TEXT
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    especie VARCHAR(50),
    raza VARCHAR(50),
    fecha_nacimiento DATE,
    sexo ENUM('M', 'H', 'Desconocido'),
    propietario_id INT,
    peso DECIMAL(5,2),
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propietario_id) REFERENCES propietarios(id)
);

-- Tabla de inventario
CREATE TABLE IF NOT EXISTS inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    cantidad INT NOT NULL DEFAULT 0,
    precio_unitario DECIMAL(10,2),
    categoria VARCHAR(50),
    stock_minimo INT DEFAULT 5,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT,
    fecha_hora DATETIME NOT NULL,
    tipo_consulta VARCHAR(100),
    estado ENUM('Programada', 'Confirmada', 'Completada', 'Cancelada') DEFAULT 'Programada',
    notas TEXT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

-- Tabla de historiales
CREATE TABLE IF NOT EXISTS historiales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    paciente_id INT,
    fecha DATE NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,
    observaciones TEXT,
    veterinario_id INT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS facturas (
    id VARCHAR(20) PRIMARY KEY,
    fecha DATE NOT NULL,
    propietario_id INT,
    subtotal DECIMAL(10,2),
    iva DECIMAL(10,2),
    total DECIMAL(10,2),
    estado ENUM('Pendiente', 'Pagada', 'Anulada') DEFAULT 'Pendiente',
    forma_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia', 'Bizum'),
    FOREIGN KEY (propietario_id) REFERENCES propietarios(id)
);

-- Tabla de items de factura
CREATE TABLE IF NOT EXISTS items_factura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id VARCHAR(20),
    concepto VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2),
    iva DECIMAL(5,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (factura_id) REFERENCES facturas(id)
); 