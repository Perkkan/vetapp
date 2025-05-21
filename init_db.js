/**
 * Script para inicializar la base de datos con datos iniciales
 * Crea una clínica por defecto y establece la estructura base
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { dbPath } = require('./esquema_db');

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos SQLite:', err.message);
    process.exit(1);
  } else {
    console.log('Conectado a la base de datos SQLite');
    inicializarDatos();
  }
});

// Función para inicializar datos básicos
function inicializarDatos() {
  db.serialize(() => {
    // Insertar una clínica por defecto
    db.run(
      `INSERT INTO clinicas (nombre, direccion, telefono, email_contacto) VALUES (?, ?, ?, ?)`,
      ['Clínica Veterinaria Principal', 'Av. Principal 123', '555-123-4567', 'contacto@clinicaveterinaria.com'],
      function(err) {
        if (err) {
          console.error('Error al crear clínica inicial:', err.message);
          return;
        }
        
        const clinicaId = this.lastID;
        console.log(`Clínica creada con ID: ${clinicaId}`);
        
        // Crear un usuario administrador para la clínica
        crearUsuarioAdmin(clinicaId);
      }
    );
  });
}

// Función para generar un ID de paciente
function generarIdPaciente(idPropietario, contador) {
  return `${idPropietario}-${contador}`;
}

// Función para crear un usuario administrador
function crearUsuarioAdmin(idClinica) {
  db.run(
    `INSERT INTO usuarios (id_clinica, email, password, nombre, tipo_usuario, telefono, email_contacto) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      idClinica,
      'admin@clinicaveterinaria.com',
      'admin123',  // En un sistema real, esta contraseña debería estar hasheada
      'Administrador',
      'ADMINISTRADOR',
      '555-987-6543',
      'admin@clinicaveterinaria.com'
    ],
    function(err) {
      if (err) {
        console.error('Error al crear usuario administrador:', err.message);
      } else {
        console.log(`Usuario administrador creado con ID: ${this.lastID}`);
      }
      
      // Cerrar la conexión después de terminar
      db.close(err => {
        if (err) {
          console.error('Error al cerrar la base de datos:', err.message);
        } else {
          console.log('Inicialización completada. Conexión cerrada.');
        }
        process.exit(0);
      });
    }
  );
}

// Ejecutar el script
console.log('Iniciando la inicialización de la base de datos...'); 