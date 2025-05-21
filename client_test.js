const http = require('http');

// Configuraciones a probar para el cliente (puerto 3000)
const configs = [
  { host: 'localhost', port: 3000 },
  { host: '127.0.0.1', port: 3000 },
  { host: '0.0.0.0', port: 3000 }
];

// Índice de configuración actual
let configIndex = 0;

// Crear servidor HTTP
const server = http.createServer((req, res) => {
  // Registrar información de la solicitud
  console.log(`[${new Date().toLocaleString()}] [CLIENTE] Solicitud recibida: ${req.method} ${req.url}`);
  
  // Responder con HTML
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cliente de Prueba - Funcionando</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
          h1 { color: #2196F3; }
          .container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; background-color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .success { color: green; font-weight: bold; }
          button { background-color: #2196F3; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
          button:hover { background-color: #0b7dda; }
          #response { margin-top: 20px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; display: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Cliente de Prueba (Puerto 3000)</h1>
          <p class="success">✓ El cliente está funcionando correctamente</p>
          <p>Si puedes ver esta página, significa que el cliente HTTP está respondiendo.</p>
          <hr>
          
          <h2>Prueba de conexión con el servidor (Puerto 5000)</h2>
          <p>Haz clic en el botón para verificar la conexión con el servidor:</p>
          
          <button onclick="checkServer()">Verificar conexión con el servidor</button>
          
          <div id="response"></div>
          
          <script>
            function checkServer() {
              const responseDiv = document.getElementById('response');
              responseDiv.style.display = 'block';
              responseDiv.innerHTML = 'Verificando conexión...';
              
              // Intentar las diferentes URLs del servidor
              const urls = [
                'http://localhost:5000',
                'http://127.0.0.1:5000'
              ];
              
              // Función para intentar las URLs una por una
              function tryNextUrl(index) {
                if (index >= urls.length) {
                  responseDiv.innerHTML = '<span style="color:red">❌ Error: No se pudo conectar al servidor en ninguna URL.</span>';
                  return;
                }
                
                const url = urls[index];
                responseDiv.innerHTML = \`Verificando conexión a \${url}...\`;
                
                fetch(url, { mode: 'no-cors' })
                  .then(() => {
                    responseDiv.innerHTML = \`<span style="color:green">✓ Conexión exitosa a \${url}</span>\`;
                  })
                  .catch(error => {
                    responseDiv.innerHTML = \`<span style="color:orange">⚠️ No se pudo conectar a \${url}. Intentando siguiente URL...</span>\`;
                    setTimeout(() => tryNextUrl(index + 1), 1000);
                  });
              }
              
              // Comenzar con la primera URL
              tryNextUrl(0);
            }
          </script>
        </div>
      </body>
    </html>
  `);
});

// Función para intentar iniciar el servidor con diferentes configuraciones
function tryNextConfig() {
  if (configIndex >= configs.length) {
    console.error('No se pudo iniciar el cliente con ninguna configuración');
    process.exit(1);
    return;
  }
  
  const config = configs[configIndex];
  
  console.log(`Intentando iniciar cliente con: ${config.host}:${config.port}`);
  
  // Configurar manejador de errores
  server.once('error', (err) => {
    console.error(`Error al iniciar cliente en ${config.host}:${config.port}:`, err.message);
    configIndex++;
    tryNextConfig();
  });
  
  // Intentar iniciar el servidor
  server.listen(config.port, config.host, () => {
    const address = server.address();
    console.log(`¡CLIENTE INICIADO EXITOSAMENTE!`);
    console.log(`---------------------------------------`);
    console.log(`Cliente ejecutándose en:`);
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