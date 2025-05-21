const http = require('http');

// Configuraciones a probar (combinaciones de host/puerto)
const configs = [
  { host: 'localhost', port: 5000 },
  { host: '127.0.0.1', port: 5000 },
  { host: '0.0.0.0', port: 5000 }
];

// Índice de configuración actual
let configIndex = 0;

// Crear servidor HTTP
const server = http.createServer((req, res) => {
  // Registrar información de la solicitud
  console.log(`[${new Date().toLocaleString()}] Solicitud recibida: ${req.method} ${req.url}`);
  
  // Responder con HTML
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Servidor de Prueba - Funcionando</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #4CAF50; }
          .container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
          .success { color: green; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Servidor de Prueba</h1>
          <p class="success">✓ El servidor está funcionando correctamente</p>
          <p>Si puedes ver esta página, significa que el servidor HTTP está respondiendo correctamente.</p>
          <hr>
          <p>Información del servidor:</p>
          <ul>
            <li>Dirección: ${req.socket.localAddress}</li>
            <li>Puerto: ${req.socket.localPort}</li>
            <li>Fecha y hora: ${new Date().toLocaleString()}</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// Función para intentar iniciar el servidor con diferentes configuraciones
function tryNextConfig() {
  if (configIndex >= configs.length) {
    console.error('No se pudo iniciar el servidor con ninguna configuración');
    process.exit(1);
    return;
  }
  
  const config = configs[configIndex];
  
  console.log(`Intentando iniciar servidor con: ${config.host}:${config.port}`);
  
  // Configurar manejador de errores
  server.once('error', (err) => {
    console.error(`Error al iniciar servidor en ${config.host}:${config.port}:`, err.message);
    configIndex++;
    tryNextConfig();
  });
  
  // Intentar iniciar el servidor
  server.listen(config.port, config.host, () => {
    const address = server.address();
    console.log(`¡SERVIDOR INICIADO EXITOSAMENTE!`);
    console.log(`---------------------------------------`);
    console.log(`Servidor ejecutándose en:`);
    console.log(`- http://localhost:${address.port}`);
    console.log(`- http://127.0.0.1:${address.port}`);
    if (address.address === '0.0.0.0') {
      console.log(`- http://<tu-ip-local>:${address.port}`);
    }
    console.log(`---------------------------------------`);
    console.log(`Abre alguna de estas direcciones en tu navegador.`);
  });
}

// Iniciar el proceso
tryNextConfig(); 