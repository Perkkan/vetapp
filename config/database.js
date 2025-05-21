const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

// Crear conexión a la base de datos SQLite
const dbPath = path.resolve(__dirname, '../database/veterinaria.sqlite');
console.log('Ruta a la base de datos SQLite:', dbPath);

// Crear una conexión a la base de datos SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
    }
});

// Convertir funciones normales a promesas
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve([rows]);
        });
    });
}

// Función para ejecutar consultas que modifican datos
function exec(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
        });
    });
}

// Test de conexión
const testConnection = async () => {
    try {
        // Probar una consulta simple
        await query('SELECT 1');
        console.log('Conexión a la base de datos establecida correctamente');
        return true;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        return false;
    }
};

module.exports = {
    query,
    exec,
    testConnection,
    db
}; 