/**
 * Script para limpiar la base de datos y eliminar todos los datos existentes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configurar la ruta de la base de datos
const dbPath = path.join(__dirname, 'database/veterinaria.sqlite');
console.log('Ruta de la base de datos SQLite:', dbPath);

// Verificar si el archivo existe
if (!fs.existsSync(dbPath)) {
  console.log('La base de datos no existe. No es necesario limpiarla.');
  process.exit(0);
}

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos SQLite:', err.message);
    process.exit(1);
  } else {
    console.log('Conectado a la base de datos SQLite');
    limpiarBaseDatos();
  }
});

// Función para limpiar la base de datos
function limpiarBaseDatos() {
  db.serialize(() => {
    // Desactivar las restricciones de clave foránea temporalmente
    db.run('PRAGMA foreign_keys = OFF;');
    
    // Obtener todas las tablas de la base de datos
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';", [], (err, tablas) => {
      if (err) {
        console.error('Error al obtener las tablas:', err.message);
        return;
      }
      
      // Eliminar todos los datos de cada tabla
      tablas.forEach(tabla => {
        db.run(`DELETE FROM ${tabla.name};`, [], function(err) {
          if (err) {
            console.error(`Error al limpiar la tabla ${tabla.name}:`, err.message);
          } else {
            console.log(`Tabla ${tabla.name} limpiada correctamente. ${this.changes} filas eliminadas.`);
          }
        });
        
        // Reiniciar el contador de autoincremento
        db.run(`DELETE FROM sqlite_sequence WHERE name='${tabla.name}';`, [], err => {
          if (err) {
            console.error(`Error al reiniciar secuencia para ${tabla.name}:`, err.message);
          }
        });
      });
      
      // Volver a activar las restricciones de clave foránea
      db.run('PRAGMA foreign_keys = ON;');
      
      console.log('Limpieza de la base de datos completada.');
      
      // Cerrar la conexión después de terminar
      setTimeout(() => {
        db.close(() => {
          console.log('Conexión cerrada.');
          process.exit(0);
        });
      }, 1000);
    });
  });
} 