require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'veterinaria_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

console.log('Configuración de base de datos:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database
});

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para ejecutar consultas
const query = async (sql, params) => {
    try {
        const result = await pool.execute(sql, params);
        return result;
    } catch (error) {
        console.error('Error al ejecutar consulta SQL:', error);
        throw error;
    }
};

// Test de conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos establecida correctamente');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        return false;
    }
};

module.exports = {
    query,
    testConnection,
    pool
}; 