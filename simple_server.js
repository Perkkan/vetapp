const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Servidor HTTP básico funcionando correctamente\n');
});

server.listen(9090, '127.0.0.1', () => {
  console.log('Servidor HTTP básico ejecutándose en http://127.0.0.1:9090/');
}); 