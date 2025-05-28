require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;
  
  try {
    console.log('Iniciando configuración de la base de datos...');
    
    // Configuración de la conexión
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true // Importante para ejecutar varios comandos SQL juntos
    };
    
    // Crear conexión
    connection = await mysql.createConnection(config);
    console.log('Conexión a MySQL establecida');
    
    // Crear base de datos si no existe
    const dbName = process.env.DB_NAME || 'veterinaria_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Base de datos '${dbName}' creada o verificada`);
    
    // Usar la base de datos
    await connection.query(`USE ${dbName}`);
    
    // Leer y ejecutar el archivo de creación de tablas
    const createTablesSQL = fs.readFileSync(path.join(__dirname, 'create_tables.sql'), 'utf8');
    console.log('Ejecutando script de creación de tablas (create_tables.sql)...');
    await connection.query(createTablesSQL);
    console.log('Script create_tables.sql ejecutado correctamente');

    // Leer y ejecutar el archivo schema.sql
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('Ejecutando script schema.sql...');
    await connection.query(schemaSQL);
    console.log('Script schema.sql ejecutado correctamente');
    
    // Leer y ejecutar el archivo de inicialización de roles y permisos
    const initRolesPermisosSQL = fs.readFileSync(path.join(__dirname, 'init_roles_permisos.sql'), 'utf8');
    console.log('Ejecutando script de inicialización de roles y permisos...');
    await connection.query(initRolesPermisosSQL);
    console.log('Roles y permisos inicializados correctamente');
    
    // Crear usuario administrador inicial si no existe
    console.log('Verificando usuario administrador...');
    const [adminUsers] = await connection.query('SELECT * FROM usuarios WHERE email = "admin@veterinaria.com"');
    
    if (adminUsers.length === 0) {
      // Importar bcrypt para encriptar la contraseña
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Obtener el ID del rol superadmin
      const [roles] = await connection.query('SELECT id FROM roles WHERE nombre = "superadmin"');
      const superadminRolId = roles[0].id;
      
      // Insertar usuario superadmin
      await connection.query(
        `INSERT INTO usuarios (nombre, email, password, rol_id, activo, fecha_registro)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        ['Administrador', 'admin@veterinaria.com', hashedPassword, superadminRolId, true]
      );
      
      console.log('Usuario administrador creado exitosamente');
    } else {
      console.log('El usuario administrador ya existe');
    }
    
    console.log('¡Configuración de la base de datos completada con éxito!');
  } catch (error) {
    console.error('Error durante la configuración de la base de datos:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada');
    }
  }
}

setupDatabase(); 