/**
 * API para la veterinaria (Nueva estructura)
 * Esta API utiliza la nueva estructura de base de datos
 */

const http = require('http');
const url = require('url');
const { PERMISOS } = require('./permisos_nuevos');
const { 
  verificarCredenciales, 
  crearUsuario, 
  getUsuarios,
  getClinicas,
  getClinicaById,
  crearClinica,
  getPropietarios,
  getPropietarioById,
  crearPropietario,
  getPacientes,
  getPacienteById,
  getPacienteByIdPaciente,
  crearPaciente,
  getPacientesHospitalizados,
  getHospitalizacionById,
  crearHospitalizacion,
  actualizarHospitalizacion,
  darAltaPaciente,
  getConsultas,
  getConsultasByPaciente,
  crearConsulta,
  getHistorialPaciente,
  getInventario,
  getProductoById,
  actualizarInventario,
  getCompras,
  getCompraById,
  crearCompra,
  getEstudiosLaboratorio,
  getEstudiosLaboratorioPorPaciente,
  getEstudioLaboratorioById,
  crearEstudioLaboratorio,
  actualizarEstudioLaboratorio
} = require('./db_nueva');

// Función para verificar permisos
const verificarPermiso = (usuario, permisoRequerido) => {
  if (!usuario || !usuario.permisos) {
    return false;
  }
  
  // El superusuario solo puede acceder a los permisos específicos de gestión de clínicas y usuarios
  if (usuario.tipo_usuario === 'SUPERUSUARIO') {
    return usuario.permisos.includes(permisoRequerido) && 
           (permisoRequerido === PERMISOS.GESTIONAR_CLINICAS || 
            permisoRequerido === PERMISOS.CREAR_USUARIOS);
  }
  
  // Otros usuarios solo pueden acceder a sus permisos asignados
  return usuario.permisos.includes(permisoRequerido);
};

// Función para obtener la clínica del usuario (0 para superusuario)
const getClinicaUsuario = (usuario) => {
  if (!usuario) return null;
  return usuario.id_clinica;
};

// Función para filtrar resultados por clínica
const filtrarPorClinica = (datos, idClinica) => {
  if (idClinica === 0) {
    // El superusuario puede ver todas las clínicas
    return datos;
  }
  
  // Otros usuarios solo pueden ver datos de su clínica
  return datos.filter(item => item.id_clinica === idClinica);
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
    // Aumentar el número de listeners para eventos
    server.setMaxListeners(20);
    
    // Rutas públicas (no requieren autenticación)
    
    // RUTA ESPECIAL: Obtener todas las clínicas (para pruebas)
    if (path === '/api/clinicas' && method === 'GET') {
      try {
        console.log('API Veterinaria: Recibida petición GET /api/clinicas (SIN AUTENTICACIÓN)');
        
        const clinicas = await getClinicas();
        console.log(`API Veterinaria: Obtenidas ${clinicas.length} clínicas`);
        
        // Devolver todas las clínicas para facilitar pruebas
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clinicas));
      } catch (error) {
        console.error('Error al obtener clínicas:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener clínicas', error: error.message }));
      }
      return;
    }
    
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
    
    // OTRA RUTA ESPECIAL: Crear una nueva clínica (para pruebas)
    if (path === '/api/clinicas' && method === 'POST') {
      try {
        console.log('API Veterinaria: Recibida petición POST /api/clinicas (SIN AUTENTICACIÓN)');
        const nuevaClinica = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevaClinica.nombre) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'El nombre de la clínica es obligatorio' }));
          return;
        }
        
        const clinicaCreada = await crearClinica(nuevaClinica);
        console.log('Clínica creada con éxito:', clinicaCreada);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(clinicaCreada));
      } catch (error) {
        console.error('Error al crear clínica:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al crear clínica', error: error.message }));
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
      tipo_usuario: 'ADMINISTRATIVO',
      id_clinica: 1,
      permisos: [PERMISOS.ADMIN_TOTAL, PERMISOS.GESTIONAR_CLINICAS, PERMISOS.CREAR_USUARIOS]
    };
    
    // RUTAS PROTEGIDAS
    
    // --- GESTIÓN DE CLÍNICAS ---
    
    // Obtener una clínica por ID
    if (path.match(/^\/api\/clinicas\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/').pop());
      try {
        const clinica = await getClinicaById(id);
        if (clinica) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(clinica));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Clínica no encontrada' }));
        }
      } catch (error) {
        console.error('Error al obtener clínica:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener clínica', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE USUARIOS ---
    
    // Obtener todos los usuarios
    if (path === '/api/usuarios' && method === 'GET') {
      try {
        console.log('API Veterinaria: Recibida petición GET /api/usuarios');
        
        const usuarios = await getUsuarios();
        console.log(`API Veterinaria: Obtenidos ${usuarios.length} usuarios`);
        
        // Devolver usuarios sin passwords
        const usuariosSinPassword = usuarios.map(u => {
          const { password, ...usuarioSinPassword } = u;
          return usuarioSinPassword;
        });
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(usuariosSinPassword));
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        console.error('Detalles del error:', error.stack);
        
        // Responder con mensaje de error detallado
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          mensaje: 'Error al obtener usuarios', 
          error: error.message,
          detalles: error.stack,
          codigo: 'ERR_GET_USUARIOS'
        }));
      }
      return;
    }
    
    // Crear un nuevo usuario
    if (path === '/api/usuarios' && method === 'POST') {
      try {
        const nuevoUsuario = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevoUsuario.email || !nuevoUsuario.password || !nuevoUsuario.nombre || !nuevoUsuario.tipo_usuario || !nuevoUsuario.id_clinica) {
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
    
    // --- GESTIÓN DE PROPIETARIOS ---
    
    // Obtener todos los propietarios
    if (path === '/api/propietarios' && method === 'GET') {
      try {
        // Obtener el ID de clínica de la consulta
        const idClinica = parsedUrl.query.id_clinica ? parseInt(parsedUrl.query.id_clinica) : null;
        
        const propietarios = await getPropietarios(idClinica);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(propietarios));
      } catch (error) {
        console.error('Error al obtener propietarios:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener propietarios', error: error.message }));
      }
      return;
    }
    
    // Obtener un propietario por ID
    if (path.match(/^\/api\/propietarios\/\d+$/) && method === 'GET') {
      const id = parseInt(path.split('/').pop());
      try {
        const propietario = await getPropietarioById(id);
        if (propietario) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(propietario));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Propietario no encontrado' }));
        }
      } catch (error) {
        console.error('Error al obtener propietario:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener propietario', error: error.message }));
      }
      return;
    }
    
    // Crear un nuevo propietario
    if (path === '/api/propietarios' && method === 'POST') {
      try {
        const nuevoPropietario = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevoPropietario.nombre || !nuevoPropietario.id_clinica) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'El nombre del propietario y el ID de clínica son obligatorios' }));
          return;
        }
        
        const propietarioCreado = await crearPropietario(nuevoPropietario);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(propietarioCreado));
      } catch (error) {
        console.error('Error al crear propietario:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al crear propietario', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE PACIENTES ---
    
    // Obtener todos los pacientes
    if (path === '/api/pacientes' && method === 'GET') {
      try {
        // Obtener el ID de clínica de la consulta
        const idClinica = parsedUrl.query.id_clinica ? parseInt(parsedUrl.query.id_clinica) : null;
        
        const pacientes = await getPacientes(idClinica);
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
    
    // Obtener un paciente por ID de paciente
    if (path.match(/^\/api\/pacientes\/codigo\/[^\/]+$/) && method === 'GET') {
      const idPaciente = path.split('/').pop();
      try {
        const paciente = await getPacienteByIdPaciente(idPaciente);
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
        if (!nuevoPaciente.nombre || !nuevoPaciente.id_propietario) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'El nombre del paciente y el ID de propietario son obligatorios' }));
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
    
    // --- GESTIÓN DE HOSPITALIZACIONES ---
    
    // Obtener pacientes hospitalizados
    if (path === '/api/hospitalizaciones' && method === 'GET') {
      try {
        // Obtener el ID de clínica de la consulta
        const idClinica = parsedUrl.query.id_clinica ? parseInt(parsedUrl.query.id_clinica) : null;
        
        const pacientes = await getPacientesHospitalizados(idClinica);
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
    if (path.match(/^\/api\/hospitalizaciones\/\d+$/) && method === 'GET') {
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
    
    // Crear una nueva hospitalización
    if (path === '/api/hospitalizaciones' && method === 'POST') {
      try {
        const nuevaHospitalizacion = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevaHospitalizacion.id_paciente || !nuevaHospitalizacion.id_clinica || !nuevaHospitalizacion.id_veterinario) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Datos de hospitalización incompletos' }));
          return;
        }
        
        const hospitalizacionCreada = await crearHospitalizacion(nuevaHospitalizacion);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(hospitalizacionCreada));
      } catch (error) {
        console.error('Error al crear hospitalización:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al crear hospitalización', error: error.message }));
      }
      return;
    }
    
    // Actualizar una hospitalización
    if (path.match(/^\/api\/hospitalizaciones\/\d+$/) && method === 'PUT') {
      const id = parseInt(path.split('/').pop());
      try {
        const datosActualizados = await parseRequestBody(req);
        
        const hospitalizacionActualizada = await actualizarHospitalizacion(id, datosActualizados);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(hospitalizacionActualizada));
      } catch (error) {
        console.error('Error al actualizar hospitalización:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al actualizar hospitalización', error: error.message }));
      }
      return;
    }
    
    // Dar de alta a un paciente hospitalizado
    if (path.match(/^\/api\/hospitalizaciones\/\d+\/alta$/) && method === 'POST') {
      const id = parseInt(path.split('/')[3]);
      try {
        const resultado = await darAltaPaciente(id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(resultado));
      } catch (error) {
        console.error('Error al dar de alta al paciente:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al dar de alta al paciente', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE CONSULTAS ---
    
    // Obtener todas las consultas
    if (path === '/api/consultas' && method === 'GET') {
      try {
        // Obtener el ID de clínica de la consulta
        const idClinica = parsedUrl.query.id_clinica ? parseInt(parsedUrl.query.id_clinica) : null;
        
        const consultas = await getConsultas(idClinica);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(consultas));
      } catch (error) {
        console.error('Error al obtener consultas:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener consultas', error: error.message }));
      }
      return;
    }
    
    // Obtener consultas de un paciente
    if (path.match(/^\/api\/consultas\/paciente\/[^\/]+$/) && method === 'GET') {
      const idPaciente = path.split('/').pop();
      try {
        const consultas = await getConsultasByPaciente(idPaciente);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(consultas));
      } catch (error) {
        console.error('Error al obtener consultas del paciente:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener consultas del paciente', error: error.message }));
      }
      return;
    }
    
    // Crear una nueva consulta
    if (path === '/api/consultas' && method === 'POST') {
      try {
        const nuevaConsulta = await parseRequestBody(req);
        
        // Validar datos mínimos
        if (!nuevaConsulta.id_paciente || !nuevaConsulta.id_clinica || !nuevaConsulta.id_veterinario) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ mensaje: 'Datos de consulta incompletos' }));
          return;
        }
        
        const consultaCreada = await crearConsulta(nuevaConsulta);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(consultaCreada));
      } catch (error) {
        console.error('Error al crear consulta:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al crear consulta', error: error.message }));
      }
      return;
    }
    
    // --- GESTIÓN DE HISTORIALES ---
    
    // Obtener historial de un paciente
    if (path.match(/^\/api\/historiales\/paciente\/[^\/]+$/) && method === 'GET') {
      const idPaciente = path.split('/').pop();
      try {
        const historial = await getHistorialPaciente(idPaciente);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(historial));
      } catch (error) {
        console.error('Error al obtener historial del paciente:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al obtener historial del paciente', error: error.message }));
      }
      return;
    }

    // Ruta para eliminar todos los usuarios excepto el superusuario
    if (path === '/api/reset-users' && method === 'POST') {
      try {
        const eliminarUsuarios = async () => {
          return new Promise((resolve, reject) => {
            // Eliminar todos los usuarios excepto el superusuario
            db.run("DELETE FROM usuarios WHERE tipo_usuario != 'SUPERUSUARIO'", function(err) {
              if (err) {
                reject(err);
                return;
              }
              
              resolve({ eliminados: this.changes });
            });
          });
        };
        
        const eliminarPermisos = async () => {
          return new Promise((resolve, reject) => {
            // Eliminar todos los permisos de usuarios eliminados
            db.run("DELETE FROM usuario_permisos WHERE usuario_id NOT IN (SELECT id FROM usuarios)", function(err) {
              if (err) {
                reject(err);
                return;
              }
              
              resolve({ eliminados: this.changes });
            });
          });
        };
        
        const result = await eliminarUsuarios();
        await eliminarPermisos();
        
        // Verificar si existe el superusuario
        db.get("SELECT COUNT(*) as count FROM usuarios WHERE tipo_usuario = 'SUPERUSUARIO'", [], async (err, row) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ mensaje: 'Error al verificar superusuario', error: err.message }));
            return;
          }
          
          if (row.count === 0) {
            // Crear superusuario
            const superusuario = {
              id_clinica: 0,
              email: 'super@sistema.com',
              password: 'super123',
              nombre: 'Superusuario',
              tipo_usuario: 'SUPERUSUARIO'
            };
            
            try {
              await crearUsuario(superusuario);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                mensaje: 'Usuarios eliminados y superusuario creado', 
                usuarios_eliminados: result.eliminados,
                superusuario_email: superusuario.email,
                superusuario_password: superusuario.password
              }));
            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ mensaje: 'Error al crear superusuario', error: error.message }));
            }
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              mensaje: 'Usuarios eliminados. Superusuario existente mantenido.', 
              usuarios_eliminados: result.eliminados
            }));
          }
        });
      } catch (error) {
        console.error('Error al eliminar usuarios:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Error al eliminar usuarios', error: error.message }));
      }
      return;
    }

    // Para otras rutas no reconocidas
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ mensaje: 'Ruta no encontrada' }));
    
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ mensaje: 'Error interno del servidor', error: error.message }));
  }
});

// ----- NUEVOS ENDPOINTS PARA MÓDULO DE COMPRAS -----

// Obtener todos los productos del inventario
server.on('request', async (req, res) => {
  if (req.url === '/api/inventario' && req.method === 'GET') {
    try {
      // En un sistema real, aquí verificaríamos el token y los permisos
      const usuarioAutenticado = { 
        id: 1, 
        nombre: 'Administrador', 
        permisos: [PERMISOS.ADMIN_TOTAL]
      };
      
      // Obtener id_clinica (en un sistema real vendría de los parámetros)
      const id_clinica = 1; // Por defecto usamos la clínica 1
      
      const productos = await getInventario(id_clinica);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(productos));
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al obtener inventario', error: error.message }));
    }
  }
});

// Obtener un producto por ID
server.on('request', async (req, res) => {
  const match = req.url.match(/^\/api\/inventario\/(\d+)$/);
  if (match && req.method === 'GET') {
    try {
      const id = parseInt(match[1]);
      const producto = await getProductoById(id);
      
      if (producto) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(producto));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Producto no encontrado' }));
      }
    } catch (error) {
      console.error('Error al obtener producto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al obtener producto', error: error.message }));
    }
  }
});

// Crear o actualizar un producto
server.on('request', async (req, res) => {
  if (req.url === '/api/inventario' && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const productoData = await parseRequestBody(req);
      
      // Validar datos mínimos
      if (!productoData.nombre) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'El nombre del producto es obligatorio' }));
        return;
      }
      
      if (!productoData.id && !productoData.id_clinica) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'El ID de clínica es obligatorio para nuevos productos' }));
        return;
      }
      
      const producto = await actualizarInventario(productoData);
      
      res.writeHead(req.method === 'POST' ? 201 : 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(producto));
    } catch (error) {
      console.error('Error al gestionar producto:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        mensaje: req.method === 'POST' ? 'Error al crear producto' : 'Error al actualizar producto', 
        error: error.message 
      }));
    }
  }
});

// Obtener todas las compras
server.on('request', async (req, res) => {
  if (req.url === '/api/compras' && req.method === 'GET') {
    try {
      // En un sistema real, aquí verificaríamos el token y los permisos
      
      // Obtener id_clinica (en un sistema real vendría de los parámetros)
      const id_clinica = 1; // Por defecto usamos la clínica 1
      
      const compras = await getCompras(id_clinica);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(compras));
    } catch (error) {
      console.error('Error al obtener compras:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al obtener compras', error: error.message }));
    }
  }
});

// Obtener una compra por ID
server.on('request', async (req, res) => {
  const match = req.url.match(/^\/api\/compras\/(\d+)$/);
  if (match && req.method === 'GET') {
    try {
      const id = parseInt(match[1]);
      const compra = await getCompraById(id);
      
      if (compra) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(compra));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Compra no encontrada' }));
      }
    } catch (error) {
      console.error('Error al obtener compra:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al obtener compra', error: error.message }));
    }
  }
});

// Crear una nueva compra
server.on('request', async (req, res) => {
  if (req.url === '/api/compras' && req.method === 'POST') {
    try {
      const compraData = await parseRequestBody(req);
      
      // Validar datos mínimos
      if (!compraData.id_clinica) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'El ID de clínica es obligatorio' }));
        return;
      }
      
      if (!compraData.items || !Array.isArray(compraData.items) || compraData.items.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Se requiere al menos un ítem en la compra' }));
        return;
      }
      
      // Calcular el total si no viene incluido
      if (!compraData.total) {
        compraData.total = compraData.items.reduce((total, item) => {
          return total + (item.subtotal || (item.cantidad * item.precio_unitario));
        }, 0);
      }
      
      const compra = await crearCompra(compraData);
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(compra));
    } catch (error) {
      console.error('Error al crear compra:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al crear compra', error: error.message }));
    }
  }
});

// ----- NUEVOS ENDPOINTS PARA MÓDULO DE LABORATORIO -----

// Obtener todos los estudios de laboratorio
server.on('request', async (req, res) => {
  if (req.url === '/api/laboratorio' && req.method === 'GET') {
    try {
      // En un sistema real, aquí verificaríamos el token y los permisos
      
      // Obtener id_clinica (en un sistema real vendría de los parámetros)
      const id_clinica = 1; // Por defecto usamos la clínica 1
      
      const estudios = await getEstudiosLaboratorio(id_clinica);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(estudios));
    } catch (error) {
      console.error('Error al obtener estudios de laboratorio:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al obtener estudios de laboratorio', error: error.message }));
    }
  }
});

// Obtener estudios de laboratorio por paciente
server.on('request', async (req, res) => {
  const match = req.url.match(/^\/api\/laboratorio\/paciente\/(\d+)$/);
  if (match && req.method === 'GET') {
    try {
      const pacienteId = parseInt(match[1]);
      const estudios = await getEstudiosLaboratorioPorPaciente(pacienteId);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(estudios));
    } catch (error) {
      console.error('Error al obtener estudios de laboratorio del paciente:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al obtener estudios de laboratorio del paciente', error: error.message }));
    }
  }
});

// Obtener un estudio de laboratorio por ID
server.on('request', async (req, res) => {
  const match = req.url.match(/^\/api\/laboratorio\/(\d+)$/);
  if (match && req.method === 'GET') {
    try {
      const id = parseInt(match[1]);
      const estudio = await getEstudioLaboratorioById(id);
      
      if (estudio) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(estudio));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'Estudio de laboratorio no encontrado' }));
      }
    } catch (error) {
      console.error('Error al obtener estudio de laboratorio:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al obtener estudio de laboratorio', error: error.message }));
    }
  }
});

// Crear un nuevo estudio de laboratorio
server.on('request', async (req, res) => {
  if (req.url === '/api/laboratorio' && req.method === 'POST') {
    try {
      const estudioData = await parseRequestBody(req);
      
      // Validar datos mínimos
      if (!estudioData.paciente_id) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'El ID del paciente es obligatorio' }));
        return;
      }
      
      if (!estudioData.id_clinica) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'El ID de clínica es obligatorio' }));
        return;
      }
      
      if (!estudioData.tipo) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ mensaje: 'El tipo de estudio es obligatorio' }));
        return;
      }
      
      const estudio = await crearEstudioLaboratorio(estudioData);
      
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(estudio));
    } catch (error) {
      console.error('Error al crear estudio de laboratorio:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al crear estudio de laboratorio', error: error.message }));
    }
  }
});

// Actualizar un estudio de laboratorio
server.on('request', async (req, res) => {
  const match = req.url.match(/^\/api\/laboratorio\/(\d+)$/);
  if (match && req.method === 'PUT') {
    try {
      const id = parseInt(match[1]);
      const estudioData = await parseRequestBody(req);
      
      const estudio = await actualizarEstudioLaboratorio(id, estudioData);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(estudio));
    } catch (error) {
      console.error('Error al actualizar estudio de laboratorio:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: 'Error al actualizar estudio de laboratorio', error: error.message }));
    }
  }
});

// Iniciar el servidor
const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Servidor API Nueva ejecutándose en http://localhost:${PORT}`);
  
  // Verificar si hay clínicas en la base de datos
  const checkClinicas = async () => {
    try {
      const clinicas = await getClinicas();
      console.log(`Clínicas disponibles: ${clinicas.length}`);
      if (clinicas.length === 0) {
        console.log('No hay clínicas registradas. Creando clínica por defecto...');
        try {
          await crearClinica({
            nombre: 'Clínica Veterinaria Principal',
            direccion: 'Calle Principal #123',
            telefono: '555-1234',
            email_contacto: 'contacto@clinicaveterinaria.com'
          });
          console.log('Clínica por defecto creada exitosamente');
        } catch (error) {
          console.error('Error al crear clínica por defecto:', error);
        }
      } else {
        console.log('Clínicas encontradas:');
        clinicas.forEach(c => console.log(` - ID: ${c.id}, Nombre: ${c.nombre}`));
      }
    } catch (error) {
      console.error('Error al verificar clínicas:', error);
    }
  };
  
  // Ejecutar verificación
  checkClinicas();
}); 