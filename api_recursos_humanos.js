const http = require('http');
const url = require('url');

// Base de datos simulada
let personal = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Endpoint para registrar personal
  if (path === '/api/recursos-humanos' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const nuevoPersonal = JSON.parse(body);
        nuevoPersonal.id = personal.length + 1;
        nuevoPersonal.fechaRegistro = new Date().toISOString();
        personal.push(nuevoPersonal);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Personal registrado exitosamente' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al registrar el personal' }));
      }
    });
  }

  // Endpoint para obtener todo el personal
  else if (path === '/api/recursos-humanos' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(personal));
  }

  // Endpoint para obtener personal por tipo
  else if (path === '/api/recursos-humanos/tipo' && method === 'GET') {
    const tipo = parsedUrl.query.tipo;
    const personalFiltrado = personal.filter(p => p.tipo === tipo);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(personalFiltrado));
  }

  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

const PORT = 5006;
server.listen(PORT, () => {
  console.log(`Servidor de Recursos Humanos ejecutándose en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('POST /api/recursos-humanos - Registrar nuevo personal');
  console.log('GET  /api/recursos-humanos - Obtener todo el personal');
  console.log('GET  /api/recursos-humanos/tipo?tipo=veterinario - Obtener personal por tipo');
}); 