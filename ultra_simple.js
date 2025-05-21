const http = require('http');

const PORT = 9000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('El servidor está funcionando correctamente\n');
});

server.listen(PORT, () => {
  console.log(`Servidor iniciado en: http://localhost:${PORT}`);
  console.log(`También prueba con: http://127.0.0.1:${PORT}`);
}); 