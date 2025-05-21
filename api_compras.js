const http = require('http');
const url = require('url');

// Base de datos simulada
let inventario = [];
let compras = [];

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

  // Endpoint para registrar compras
  if (path === '/api/compras' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const compra = JSON.parse(body);
        
        // Verificar si el producto ya existe en inventario
        const productoExistente = inventario.find(p => p.id === compra.id);
        
        if (productoExistente) {
          // Actualizar cantidad en inventario
          productoExistente.cantidad += parseInt(compra.cantidad);
        } else {
          // Agregar nuevo producto al inventario
          inventario.push({
            id: compra.id,
            nombre: compra.nombre,
            fabricante: compra.fabricante,
            cantidad: parseInt(compra.cantidad)
          });
        }

        // Registrar la compra
        compras.push({
          ...compra,
          fecha: new Date().toISOString()
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Compra registrada exitosamente' }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Error al procesar la compra' }));
      }
    });
  }

  // Endpoint para obtener inventario
  else if (path === '/api/inventario' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(inventario));
  }

  // Endpoint para obtener historial de compras
  else if (path === '/api/compras' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(compras));
  }

  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

const PORT = 5004;
server.listen(PORT, () => {
  console.log(`Servidor de compras ejecutándose en http://localhost:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log('POST /api/compras - Registrar una nueva compra');
  console.log('GET  /api/inventario - Obtener inventario actual');
  console.log('GET  /api/compras - Obtener historial de compras');
}); 