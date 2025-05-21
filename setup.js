/**
 * Script para inicializar la nueva estructura de la base de datos
 */

console.log('===============================================');
console.log('Iniciando configuración de la base de datos...');
console.log('===============================================');

// Ejecutar los scripts en orden
const { spawn } = require('child_process');

// Función para ejecutar un script y esperar a que termine
function ejecutarScript(script) {
  return new Promise((resolve, reject) => {
    console.log(`\nEjecutando: ${script}\n`);
    
    const proceso = spawn('node', [script], {
      stdio: 'inherit'
    });
    
    proceso.on('close', (code) => {
      if (code === 0) {
        console.log(`\nScript ${script} ejecutado correctamente`);
        resolve();
      } else {
        console.error(`\nError al ejecutar el script ${script}. Código: ${code}`);
        reject();
      }
    });
    
    proceso.on('error', (err) => {
      console.error(`\nError al iniciar el script ${script}: ${err.message}`);
      reject(err);
    });
  });
}

// Ejecutar los scripts en secuencia
(async function() {
  try {
    // 1. Crear esquema
    await ejecutarScript('esquema_db.js');
    console.log('Esquema de base de datos creado correctamente');
    
    // 2. Inicializar datos básicos
    await ejecutarScript('init_db.js');
    console.log('Datos iniciales creados correctamente');
    
    console.log('\n===============================================');
    console.log('Configuración completada con éxito.');
    console.log('===============================================');
    
  } catch (error) {
    console.error('\n===============================================');
    console.error('Error durante la configuración:', error);
    console.error('===============================================');
    process.exit(1);
  }
})(); 