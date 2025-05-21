/**
 * Definición del esquema de la base de datos para la veterinaria
 * Siguiendo las especificaciones propuestas
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configurar la ruta de la base de datos
const dbPath = path.join(__dirname, 'database/veterinaria_nueva.sqlite');
console.log('Ruta de la base de datos SQLite:', dbPath);

// Asegurar que el directorio existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Directorio creado: ${dbDir}`);
}

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
    crearEsquema();
  }
});

// Función para crear el esquema de la base de datos
function crearEsquema() {
  db.serialize(() => {
    // Tabla de clínicas
    db.run(`CREATE TABLE IF NOT EXISTS clinicas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      direccion TEXT,
      telefono TEXT,
      email_contacto TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de usuarios (veterinarios, recepcionistas, etc.)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_clinica INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      tipo_usuario TEXT NOT NULL,
      telefono TEXT,
      email_contacto TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id)
    )`);

    // Tabla de permisos de usuario
    db.run(`CREATE TABLE IF NOT EXISTS usuario_permisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      permiso TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    // Tabla de propietarios
    db.run(`CREATE TABLE IF NOT EXISTS propietarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_clinica INTEGER NOT NULL,
      email TEXT,
      telefono TEXT,
      nombre TEXT NOT NULL,
      direccion TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id)
    )`);

    // Tabla de pacientes
    db.run(`CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_propietario INTEGER NOT NULL,
      id_paciente TEXT UNIQUE NOT NULL, /* Formato: id_propietario-n */
      id_clinica INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      especie TEXT,
      raza TEXT,
      sexo TEXT,
      peso REAL,
      pelaje TEXT, /* Color y tipo de pelaje, piel o escamas */
      detalles TEXT,
      conducta TEXT, /* Actitud del paciente */
      id_historial TEXT UNIQUE, /* Igual al id_paciente */
      estado_actual TEXT DEFAULT 'activo', /* activo, inactivo, hospitalizado, en consulta */
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_propietario) REFERENCES propietarios(id),
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id)
    )`);

    // Tabla de consultas (anteriormente historiales_medicos)
    db.run(`CREATE TABLE IF NOT EXISTS consultas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_paciente TEXT NOT NULL,
      id_clinica INTEGER NOT NULL,
      id_veterinario INTEGER NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      motivo TEXT,
      tipo TEXT,
      diagnostico TEXT,
      tratamiento TEXT,
      observaciones TEXT,
      FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente),
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id),
      FOREIGN KEY (id_veterinario) REFERENCES usuarios(id)
    )`);

    // Tabla de hospitalizaciones
    db.run(`CREATE TABLE IF NOT EXISTS hospitalizaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_paciente TEXT NOT NULL,
      id_clinica INTEGER NOT NULL,
      id_veterinario INTEGER NOT NULL,
      hora_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
      hora_fin DATETIME,
      motivo TEXT,
      procedimientos_realizados TEXT,
      medicacion_actual TEXT,
      notas TEXT,
      estado_paciente TEXT,
      fecha_prevista_alta DATETIME,
      FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente),
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id),
      FOREIGN KEY (id_veterinario) REFERENCES usuarios(id)
    )`);

    // Tabla de historiales (registro de todas las interacciones médicas)
    db.run(`CREATE TABLE IF NOT EXISTS historiales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_paciente TEXT NOT NULL,
      id_historial TEXT NOT NULL, /* Igual al id_paciente */
      tipo_registro TEXT NOT NULL, /* consulta, hospitalizacion, laboratorio */
      id_registro INTEGER NOT NULL, /* ID de la consulta, hospitalización o estudio */
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)
    )`);

    // Tabla de laboratorio
    db.run(`CREATE TABLE IF NOT EXISTS laboratorio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_clinica INTEGER NOT NULL,
      id_estudio TEXT NOT NULL,
      id_paciente TEXT NOT NULL,
      id_veterinario INTEGER NOT NULL,
      fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
      tipo_estudio TEXT,
      tipo_muestra TEXT,
      resultados TEXT,
      observaciones TEXT,
      fecha_finalizacion DATETIME,
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id),
      FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente),
      FOREIGN KEY (id_veterinario) REFERENCES usuarios(id)
    )`);

    // Tabla de inventario
    db.run(`CREATE TABLE IF NOT EXISTS inventario (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_clinica INTEGER NOT NULL,
      id_producto TEXT UNIQUE,
      tipo_producto TEXT,
      nombre_producto TEXT NOT NULL,
      fabricante TEXT,
      precio_compra REAL,
      precio_venta REAL,
      cantidad_stock INTEGER DEFAULT 0,
      cantidad_minima INTEGER DEFAULT 1,
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id)
    )`);

    // Tabla de compras
    db.run(`CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_clinica INTEGER NOT NULL,
      numero_factura TEXT,
      nombre_producto TEXT NOT NULL,
      tipo_producto TEXT,
      fabricante TEXT,
      distribuidor TEXT,
      cantidad INTEGER NOT NULL,
      precio_compra REAL,
      iva REAL,
      fecha_compra DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id)
    )`);

    // Tabla de citas
    db.run(`CREATE TABLE IF NOT EXISTS citas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_clinica INTEGER NOT NULL,
      id_veterinario INTEGER NOT NULL,
      id_paciente TEXT NOT NULL,
      fecha_hora DATETIME NOT NULL,
      motivo TEXT,
      estado TEXT DEFAULT 'pendiente', /* pendiente, finalizada, cancelada */
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id),
      FOREIGN KEY (id_veterinario) REFERENCES usuarios(id),
      FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)
    )`);

    // Tabla de facturas
    db.run(`CREATE TABLE IF NOT EXISTS facturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_clinica INTEGER NOT NULL,
      numero TEXT UNIQUE,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      id_propietario INTEGER NOT NULL,
      subtotal REAL,
      iva REAL,
      total REAL,
      forma_pago TEXT,
      estado TEXT DEFAULT 'pendiente',
      FOREIGN KEY (id_clinica) REFERENCES clinicas(id),
      FOREIGN KEY (id_propietario) REFERENCES propietarios(id)
    )`);

    // Tabla de items de facturas
    db.run(`CREATE TABLE IF NOT EXISTS factura_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      factura_id INTEGER,
      id_producto TEXT,
      concepto TEXT,
      cantidad INTEGER,
      precio_unitario REAL,
      tipo_iva INTEGER,
      FOREIGN KEY (factura_id) REFERENCES facturas(id),
      FOREIGN KEY (id_producto) REFERENCES inventario(id_producto)
    )`);

    console.log('Esquema de base de datos creado correctamente');
    
    // Cerrar la conexión después de crear el esquema
    db.close(err => {
      if (err) {
        console.error('Error al cerrar la base de datos:', err.message);
      } else {
        console.log('Conexión a la base de datos cerrada correctamente');
      }
    });
  });
}

// Exportar funciones y objetos necesarios
module.exports = {
  dbPath,
  crearEsquema
}; 