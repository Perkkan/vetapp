const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <html>
      <head>
        <title>Servidor de Prueba</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #4CAF50; }
          .success { color: green; }
        </style>
      </head>
      <body>
        <h1>Servidor de Prueba</h1>
        <p class="success">✓ El servidor está funcionando correctamente</p>
        <p>Esta es una página de prueba para verificar que el servidor HTTP está respondiendo.</p>
        <p>Fecha y hora: ${new Date().toLocaleString()}</p>
      </body>
    </html>
  `);
});

// Intentar varios puertos diferentes
const ports = [3000, 3001, 5000, 8080, 8000];
let currentPortIndex = 0;

function tryListen() {
  if (currentPortIndex >= ports.length) {
    console.error('No se pudo iniciar el servidor en ninguno de los puertos disponibles');
    return;
  }

  const port = ports[currentPortIndex];
  
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Puerto ${port} en uso, intentando otro...`);
      currentPortIndex++;
      tryListen();
    } else {
      console.error(`Error al iniciar el servidor en el puerto ${port}:`, err);
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`Servidor HTTP muy simple ejecutándose en http://127.0.0.1:${port}/`);
    console.log(`Por favor, abre esta URL exacta en tu navegador.`);
  });
}

tryListen(); 