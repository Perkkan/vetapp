const http = require('http');
const url = require('url');
const { PERMISOS } = require('./permisos');
const { 
  verificarCredenciales, 
  crearUsuario, 
  getUsuarios,
  getPacientes,
  getPacienteById,
  crearPaciente,
  getPacientesEspera,
  getPacientesConsulta,
  getPacientesHospitalizados,
  getHospitalizacionById,
  getHistorialesMedicos,
  getHistorialesByPacienteId,
  crearHistorialMedico,
  getFacturas,
  getFacturaById,
  crearFactura
} = require('./db');

// Función para verificar permisos
const verificarPermiso = (usuario, permisoRequerido) => {
  return usuario && (usuario.permisos.includes(permisoRequerido) || usuario.permisos.includes(PERMISOS.ADMIN_TOTAL));
};

// Función para parsear el cuerpo de la solicitud
const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Rutas públicas (no requieren autenticación)
    
    // Autenticación
    if (path === '/api/auth/login' && method === 'POST') {
      try {
        const { email, password } = await parseRequestBody(req);
        
        try {
          const usuario = await verificarCredenciales(email, password);
          
          if (usuario) {
            const { password, ...usuarioSinPassword } = usuario;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              token: 'token_simulado',
              usuario: usuarioSinPassword
            }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ mensaje: 'Credenciales inválidas' }));
          }
        } catch (error) {
          console.error('Error al verificar credenciales:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Error al verificar credenciales', error: error.message }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error en la solicitud' }));
      }
      return;
    }
    
    // Endpoints para gestión de usuarios
    if (path === '/api/usuarios' && method === 'POST') {
      try {
        const nuevoUsuario = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevoUsuario.email || !nuevoUsuario.password || !nuevoUsuario.nombre || !nuevoUsuario.rol) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Datos de usuario incompletos' }));
          return;
        }
        
        try {
          const usuarioCreado = await crearUsuario(nuevoUsuario);
          
          // Omitir el password en la respuesta
          const { password, ...usuarioSinPassword } = usuarioCreado;
          
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(usuarioSinPassword));
        } catch (error) {
          console.error('Error al crear usuario:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Error al crear usuario', error: error.message }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error en la solicitud', error: error.message }));
      }
      return;
    }
    
    // Verificar token para rutas protegidas
    const token = req.headers.authorization;
    if (!token && path !== '/api/auth/login') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'No autorizado' }));
      return;
    }
    
    // En un sistema real, aquí se verificaría el token y se obtendría el usuario
    // En este caso simulado, asumimos que hay un usuario autenticado con permisos completos
    // para poder probar todas las funcionalidades
    const usuarioAutenticado = { 
      id: 1, 
      nombre: 'Administrador', 
      permisos: [PERMISOS.ADMIN_TOTAL]
    };
    
    // RUTAS PROTEGIDAS
    
    // --- GESTIÓN DE USUARIOS ---
    
    if (path === '/api/usuarios' && method === 'GET') {
      try {
        const usuarios = await getUsuarios();
        
        // Devolver usuarios sin passwords
        const usuariosSinPassword = usuarios.map(u => {
          const { password, ...usuarioSinPassword } = u;
          return usuarioSinPassword;
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(usuariosSinPassword));
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener usuarios', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE PACIENTES ---
    
    // Obtener todos los pacientes
    if (path === '/api/pacientes' && method === 'GET') {
      try {
        const pacientes = await getPacientes();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pacientes));
      } catch (error) {
        console.error('Error al obtener pacientes:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener pacientes', error: error.message }));
      }
      return;
    }
    
    // Obtener un paciente por ID
    if (path.match(/^\/api\/pacientes\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/').pop());
      try {
        const paciente = await getPacienteById(id);
        if (paciente) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(paciente));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Paciente no encontrado' }));
        }
      } catch (error) {
        console.error('Error al obtener paciente:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener paciente', error: error.message }));
      }
      return;
    }
    
    // Crear un nuevo paciente
    if (path === '/api/pacientes' && method === 'POST') {
      try {
        const nuevoPaciente = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevoPaciente.nombre) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'El nombre del paciente es obligatorio' }));
          return;
        }
        
        const pacienteCreado = await crearPaciente(nuevoPaciente);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pacienteCreado));
      } catch (error) {
        console.error('Error al crear paciente:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al crear paciente', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE SALA DE ESPERA ---
    
    // Obtener pacientes en sala de espera
    if (path === '/api/sala-espera/espera' && method === 'GET') {
      try {
        const pacientes = await getPacientesEspera();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pacientes));
      } catch (error) {
        console.error('Error al obtener pacientes en espera:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener pacientes en espera', error: error.message }));
      }
      return;
    }
    
    // Obtener pacientes en consulta
    if (path === '/api/sala-espera/consulta' && method === 'GET') {
      try {
        const pacientes = await getPacientesConsulta();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pacientes));
      } catch (error) {
        console.error('Error al obtener pacientes en consulta:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener pacientes en consulta', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE HOSPITALIZACIONES ---
    
    // Obtener pacientes hospitalizados
    if (path === '/api/sala-espera/hospitalizados' && method === 'GET') {
      try {
        const pacientes = await getPacientesHospitalizados();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(pacientes));
      } catch (error) {
        console.error('Error al obtener pacientes hospitalizados:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener pacientes hospitalizados', error: error.message }));
      }
      return;
    }
    
    // Obtener detalle de una hospitalización
    if (path.match(/^\/api\/sala-espera\/hospitalizados\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/').pop());
      try {
        const hospitalizacion = await getHospitalizacionById(id);
        if (hospitalizacion) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(hospitalizacion));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Hospitalización no encontrada' }));
        }
      } catch (error) {
        console.error('Error al obtener hospitalización:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener hospitalización', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE HISTORIALES MÉDICOS ---
    
    // Obtener todos los historiales médicos
    if (path === '/api/historiales' && method === 'GET') {
      try {
        const historiales = await getHistorialesMedicos();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(historiales));
      } catch (error) {
        console.error('Error al obtener historiales médicos:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener historiales médicos', error: error.message }));
      }
      return;
    }
    
    // Obtener historiales de un paciente
    if (path.match(/^\/api\/historiales\/paciente\/\d+$/) && method === 'GET') {
      const pacienteId = parseInt(path.split('/').pop());
      try {
        const historiales = await getHistorialesByPacienteId(pacienteId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(historiales));
      } catch (error) {
        console.error('Error al obtener historiales del paciente:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener historiales del paciente', error: error.message }));
      }
      return;
    }
    
    // Crear un nuevo historial médico
    if (path === '/api/historiales' && method === 'POST') {
      try {
        const nuevoHistorial = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevoHistorial.paciente_id || !nuevoHistorial.tipo) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Datos de historial incompletos' }));
          return;
        }
        
        const historialCreado = await crearHistorialMedico(nuevoHistorial);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(historialCreado));
      } catch (error) {
        console.error('Error al crear historial médico:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al crear historial médico', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE FACTURAS ---
    
    // Obtener todas las facturas
    if (path === '/api/facturas' && method === 'GET') {
      try {
        const facturas = await getFacturas();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(facturas));
      } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener facturas', error: error.message }));
      }
      return;
    }
    
    // Obtener una factura por ID
    if (path.match(/^\/api\/facturas\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/').pop());
      try {
        const factura = await getFacturaById(id);
        if (factura) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(factura));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Factura no encontrada' }));
        }
      } catch (error) {
        console.error('Error al obtener factura:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener factura', error: error.message }));
      }
      return;
    }
    
    // Crear una nueva factura
    if (path === '/api/facturas' && method === 'POST') {
      try {
        const nuevaFactura = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevaFactura.cliente_id || !nuevaFactura.numero) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Datos de factura incompletos' }));
          return;
        }
        
        const facturaCreada = await crearFactura(nuevaFactura);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(facturaCreada));
      } catch (error) {
        console.error('Error al crear factura:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al crear factura', error: error.message }));
      }
      return;
    }

    // Ruta no encontrada
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ mensaje: 'Ruta no encontrada' }));
  } catch (error) {
    console.error('Error no controlado:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ mensaje: 'Error interno del servidor', error: error.message }));
  }
});

// Iniciar servidor
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Servidor API ejecutándose en http://localhost:${PORT}`);
}); 