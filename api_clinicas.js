const http = require('http');
const url = require('url');

// Base de datos simulada
let clinicas = [];

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

  // Endpoint para obtener todas las clínicas
  if (path === '/api/clinicas' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(clinicas));
  }

  // Endpoint para crear una nueva clínica
  else if (path === '/api/clinicas' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const clinica = JSON.parse(body);
        clinica.id = clinicas.length + 1;
        clinicas.push(clinica);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clinica));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al procesar la solicitud' }));
      }
    });
  }

  // Endpoint para actualizar una clínica
  else if (path.startsWith('/api/clinicas/') && method === 'PUT') {
    const id = parseInt(path.split('/').pop());
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const updatedClinica = JSON.parse(body);
        const index = clinicas.findIndex(c => c.id === id);
        
        if (index !== -1) {
          clinicas[index] = { ...clinicas[index], ...updatedClinica };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(clinicas[index]));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Clínica no encontrada' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al procesar la solicitud' }));
      }
    });
  }

  // Endpoint para eliminar una clínica
  else if (path.startsWith('/api/clinicas/') && method === 'DELETE') {
    const id = parseInt(path.split('/').pop());
    const index = clinicas.findIndex(c => c.id === id);
    
    if (index !== -1) {
      clinicas.splice(index, 1);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Clínica eliminada exitosamente' }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Clínica no encontrada' }));
    }
  }

  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

const PORT = 5005;
server.listen(PORT, () => {
  console.log(`Servidor de Clínicas ejecutándose en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('GET    /api/clinicas - Obtener todas las clínicas');
  console.log('POST   /api/clinicas - Crear una nueva clínica');
  console.log('PUT    /api/clinicas/:id - Actualizar una clínica');
  console.log('DELETE /api/clinicas/:id - Eliminar una clínica');
}); 