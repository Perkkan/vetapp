/**
 * Módulo de acceso a datos para la nueva estructura de base de datos
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { ROLES, PERMISOS } = require('./permisos_nuevos');

// Configurar la ruta de la base de datos
const dbPath = path.join(__dirname, 'database/veterinaria_nueva.sqlite');
console.log('Ruta de la base de datos SQLite:', dbPath);

// Asegurar que el directorio existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Directorio creado: ${dbDir}`);
}

// Conectar a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
  }
});

// ---- FUNCIONES PARA USUARIOS ----

// Función para obtener permisos de un usuario
function getUsuarioPermisos(usuarioId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT permiso FROM usuario_permisos WHERE usuario_id = ?", [usuarioId], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.map(row => row.permiso));
    });
  });
}

// Función para verificar credenciales y obtener usuario
function verificarCredenciales(email, password) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM usuarios WHERE email = ? AND password = ?", [email, password], async (err, usuario) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!usuario) {
        resolve(null);
        return;
      }
      
      try {
        const permisos = await getUsuarioPermisos(usuario.id);
        usuario.permisos = permisos;
        resolve(usuario);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Función para obtener un usuario por ID
function getUsuarioById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM usuarios WHERE id = ?", [id], async (err, usuario) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!usuario) {
        resolve(null);
        return;
      }
      
      try {
        const permisos = await getUsuarioPermisos(usuario.id);
        usuario.permisos = permisos;
        resolve(usuario);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Función para crear un nuevo usuario
function crearUsuario(usuario) {
  return new Promise((resolve, reject) => {
    // Verificar el tipo de usuario y aplicar restricciones
    if (usuario.tipo_usuario === 'SUPERUSUARIO' && usuario.id_clinica !== 0) {
      reject(new Error("El Superusuario solo puede tener id_clinica = 0"));
      return;
    }
    
    if (usuario.tipo_usuario !== 'SUPERUSUARIO' && usuario.id_clinica === 0) {
      reject(new Error("Solo el Superusuario puede tener id_clinica = 0"));
      return;
    }
    
    // Verificar que se proporciona una clínica (excepto para superusuario)
    if (!usuario.id_clinica && usuario.tipo_usuario !== 'SUPERUSUARIO') {
      reject(new Error("El ID de clínica es obligatorio"));
      return;
    }

    db.run(`INSERT INTO usuarios (
      id_clinica, email, password, nombre, tipo_usuario, telefono, email_contacto
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      usuario.id_clinica,
      usuario.email,
      usuario.password,
      usuario.nombre,
      usuario.tipo_usuario,
      usuario.telefono || null,
      usuario.email_contacto || null
    ],
    function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      const usuarioId = this.lastID;
      
      // Obtener permisos según el tipo de usuario
      let permisos = [];
      if (usuario.tipo_usuario in ROLES) {
        permisos = ROLES[usuario.tipo_usuario].permisos;
      }
      
      // Insertar permisos para el usuario
      if (permisos.length === 0) {
        getUsuarioById(usuarioId)
          .then(nuevoUsuario => resolve(nuevoUsuario))
          .catch(err => reject(err));
        return;
      }

      const stmt = db.prepare("INSERT INTO usuario_permisos (usuario_id, permiso) VALUES (?, ?)");
      const promises = [];
      
      for (const permiso of permisos) {
        promises.push(
          new Promise((resolveInsert, rejectInsert) => {
            stmt.run(usuarioId, permiso, function(err) {
              if (err) rejectInsert(err);
              else resolveInsert();
            });
          })
        );
      }
      
      Promise.all(promises)
        .then(() => {
          stmt.finalize();
          getUsuarioById(usuarioId)
            .then(nuevoUsuario => resolve(nuevoUsuario))
            .catch(err => reject(err));
        })
        .catch(err => {
          stmt.finalize();
          reject(err);
        });
    });
  });
}

// Función para obtener todos los usuarios
function getUsuarios() {
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT u.*, c.nombre as clinica_nombre 
      FROM usuarios u
      JOIN clinicas c ON u.id_clinica = c.id
    `, async (err, usuarios) => {
      if (err) {
        reject(err);
        return;
      }
      
      try {
        // Obtener permisos para cada usuario
        const usuariosConPermisos = [];
        
        for (const usuario of usuarios) {
          const permisos = await getUsuarioPermisos(usuario.id);
          usuario.permisos = permisos;
          usuariosConPermisos.push(usuario);
        }
        
        resolve(usuariosConPermisos);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// ---- FUNCIONES PARA CLÍNICAS ----

// Función para obtener todas las clínicas
function getClinicas() {
  return new Promise((resolve, reject) => {
    console.log('Ejecutando consulta: SELECT * FROM clinicas');
    
    db.all("SELECT * FROM clinicas", [], (err, clinicas) => {
      if (err) {
        console.error('Error en getClinicas:', err);
        reject(err);
        return;
      }
      
      console.log(`Clínicas encontradas: ${clinicas ? clinicas.length : 0}`);
      
      // Si no hay clínicas, crear una por defecto
      if (!clinicas || clinicas.length === 0) {
        console.log('No se encontraron clínicas, creando una por defecto');
        
        db.run(`INSERT INTO clinicas (nombre, direccion, telefono, email_contacto)
                VALUES ('Clínica Veterinaria Principal', 'Calle Principal #123', '555-1234', 'contacto@clinicaveterinaria.com')`, 
          function(err) {
            if (err) {
              console.error('Error al crear clínica por defecto:', err);
              // Devolver un array vacío en lugar de rechazar la promesa
              resolve([]);
              return;
            }
            
            const clinicaDefault = {
              id: this.lastID,
              nombre: 'Clínica Veterinaria Principal',
              direccion: 'Calle Principal #123',
              telefono: '555-1234',
              email_contacto: 'contacto@clinicaveterinaria.com'
            };
            
            console.log('Clínica por defecto creada con ID:', this.lastID);
            resolve([clinicaDefault]);
          });
      } else {
        resolve(clinicas);
      }
    });
  });
}

// Función para obtener una clínica por ID
function getClinicaById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM clinicas WHERE id = ?", [id], (err, clinica) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(clinica);
    });
  });
}

// Función para crear una nueva clínica
function crearClinica(clinica) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO clinicas (nombre, direccion, telefono, email_contacto)
      VALUES (?, ?, ?, ?)
    `, [
      clinica.nombre,
      clinica.direccion || null,
      clinica.telefono || null,
      clinica.email_contacto || null
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      getClinicaById(this.lastID)
        .then(nuevaClinica => resolve(nuevaClinica))
        .catch(err => reject(err));
    });
  });
}

// ---- FUNCIONES PARA PROPIETARIOS ----

// Función para obtener todos los propietarios
function getPropietarios(id_clinica) {
  return new Promise((resolve, reject) => {
    const query = id_clinica 
      ? "SELECT * FROM propietarios WHERE id_clinica = ?"
      : "SELECT * FROM propietarios";
    
    const params = id_clinica ? [id_clinica] : [];
    
    db.all(query, params, (err, propietarios) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(propietarios);
    });
  });
}

// Función para obtener un propietario por ID
function getPropietarioById(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM propietarios WHERE id = ?", [id], (err, propietario) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(propietario);
    });
  });
}

// Función para crear un nuevo propietario
function crearPropietario(propietario) {
  return new Promise((resolve, reject) => {
    // Verificar que se proporciona una clínica
    if (!propietario.id_clinica) {
      reject(new Error("El ID de clínica es obligatorio"));
      return;
    }
    
    db.run(`
      INSERT INTO propietarios (id_clinica, nombre, telefono, email, direccion)
      VALUES (?, ?, ?, ?, ?)
    `, [
      propietario.id_clinica,
      propietario.nombre,
      propietario.telefono || null,
      propietario.email || null,
      propietario.direccion || null
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      getPropietarioById(this.lastID)
        .then(nuevoPropietario => resolve(nuevoPropietario))
        .catch(err => reject(err));
    });
  });
}

// ---- FUNCIONES PARA PACIENTES ----

// Función para generar ID de paciente
function generarIdPaciente(idPropietario, contador) {
  return `${idPropietario}-${contador}`;
}

// Función para obtener el contador de pacientes por propietario
function getContadorPacientesPorPropietario(idPropietario) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) as contador FROM pacientes WHERE id_propietario = ?",
      [idPropietario],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.contador + 1); // +1 porque queremos el siguiente número
      }
    );
  });
}

// Función para obtener todos los pacientes
function getPacientes(id_clinica) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT p.*, pr.nombre as propietario_nombre, pr.telefono as propietario_telefono 
      FROM pacientes p
      JOIN propietarios pr ON p.id_propietario = pr.id
    `;
    
    const params = [];
    
    if (id_clinica) {
      query += " WHERE p.id_clinica = ?";
      params.push(id_clinica);
    }
    
    db.all(query, params, (err, pacientes) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(pacientes);
    });
  });
}

// Función para obtener un paciente por ID
function getPacienteById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM pacientes WHERE id = ?",
      [id],
      (err, paciente) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(paciente);
      }
    );
  });
}

// Función para obtener un paciente por ID de paciente (id_propietario-n)
function getPacienteByIdPaciente(idPaciente) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM pacientes WHERE id_paciente = ?",
      [idPaciente],
      (err, paciente) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(paciente);
      }
    );
  });
}

// Función para crear un nuevo paciente
function crearPaciente(paciente) {
  return new Promise(async (resolve, reject) => {
    try {
      // Verificar que existe el propietario
      const propietario = await getPropietarioById(paciente.id_propietario);
      if (!propietario) {
        reject(new Error("El propietario no existe"));
        return;
      }
      
      // Generar ID de paciente
      const contador = await getContadorPacientesPorPropietario(paciente.id_propietario);
      const idPaciente = generarIdPaciente(paciente.id_propietario, contador);
      
      // La ID de historial es igual a la ID de paciente
      const idHistorial = idPaciente;
      
      db.run(`
        INSERT INTO pacientes (
          id_propietario, id_paciente, id_clinica, nombre, especie, raza, sexo,
          peso, pelaje, detalles, conducta, id_historial, estado_actual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        paciente.id_propietario,
        idPaciente,
        propietario.id_clinica, // Usamos la clínica del propietario
        paciente.nombre,
        paciente.especie || null,
        paciente.raza || null,
        paciente.sexo || null,
        paciente.peso || null,
        paciente.pelaje || null,
        paciente.detalles || null,
        paciente.conducta || null,
        idHistorial,
        paciente.estado_actual || 'activo'
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        getPacienteById(this.lastID)
          .then(nuevoPaciente => resolve(nuevoPaciente))
          .catch(err => reject(err));
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ---- FUNCIONES PARA HOSPITALIZACIONES ----

// Función para obtener pacientes hospitalizados
function getPacientesHospitalizados(id_clinica) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT h.*, p.nombre as paciente_nombre, p.especie, p.raza,
             u.nombre as veterinario_nombre
      FROM hospitalizaciones h
      JOIN pacientes p ON h.id_paciente = p.id_paciente
      LEFT JOIN usuarios u ON h.id_veterinario = u.id
      WHERE h.hora_fin IS NULL
    `;
    
    const params = [];
    
    if (id_clinica) {
      query += " AND h.id_clinica = ?";
      params.push(id_clinica);
    }
    
    db.all(query, params, (err, pacientes) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(pacientes);
    });
  });
}

// Función para obtener detalle de hospitalización
function getHospitalizacionById(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT h.*, p.nombre as paciente_nombre, p.especie, p.raza, p.sexo, p.peso,
             u.nombre as veterinario_nombre,
             pr.nombre as propietario_nombre, pr.telefono as propietario_telefono
      FROM hospitalizaciones h
      JOIN pacientes p ON h.id_paciente = p.id_paciente
      LEFT JOIN usuarios u ON h.id_veterinario = u.id
      LEFT JOIN propietarios pr ON p.id_propietario = pr.id
      WHERE h.id = ?
    `;
    
    db.get(query, [id], (err, hospitalizacion) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(hospitalizacion);
    });
  });
}

// Función para crear una nueva hospitalización
function crearHospitalizacion(hospitalizacion) {
  return new Promise(async (resolve, reject) => {
    try {
      // Verificar que existe el paciente
      const paciente = await getPacienteByIdPaciente(hospitalizacion.id_paciente);
      if (!paciente) {
        reject(new Error("El paciente no existe"));
        return;
      }
      
      // Actualizar el estado del paciente
      db.run(
        "UPDATE pacientes SET estado_actual = 'hospitalizado' WHERE id_paciente = ?",
        [hospitalizacion.id_paciente]
      );
      
      db.run(`
        INSERT INTO hospitalizaciones (
          id_paciente, id_clinica, id_veterinario, motivo, procedimientos_realizados,
          medicacion_actual, notas, estado_paciente, fecha_prevista_alta
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        hospitalizacion.id_paciente,
        hospitalizacion.id_clinica,
        hospitalizacion.id_veterinario,
        hospitalizacion.motivo || null,
        hospitalizacion.procedimientos_realizados || null,
        hospitalizacion.medicacion_actual || null,
        hospitalizacion.notas || null,
        hospitalizacion.estado_paciente || null,
        hospitalizacion.fecha_prevista_alta || null
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const hospitalizacionId = this.lastID;
        
        // Registrar en historial
        registrarEnHistorial(
          paciente.id_paciente,
          paciente.id_historial,
          'hospitalizacion',
          hospitalizacionId
        )
          .then(() => getHospitalizacionById(hospitalizacionId))
          .then(nuevaHospitalizacion => resolve(nuevaHospitalizacion))
          .catch(err => reject(err));
      });
    } catch (error) {
      reject(error);
    }
  });
}

// Función para actualizar una hospitalización
function actualizarHospitalizacion(id, datosActualizados) {
  return new Promise((resolve, reject) => {
    // Primero obtenemos la hospitalización actual
    getHospitalizacionById(id)
      .then(hospitalizacion => {
        if (!hospitalizacion) {
          reject(new Error("Hospitalización no encontrada"));
          return;
        }
        
        // Actualizamos los campos
        const query = `
          UPDATE hospitalizaciones SET
            procedimientos_realizados = ?,
            medicacion_actual = ?,
            notas = ?,
            estado_paciente = ?,
            fecha_prevista_alta = ?
          WHERE id = ?
        `;
        
        db.run(query, [
          datosActualizados.procedimientos_realizados || hospitalizacion.procedimientos_realizados,
          datosActualizados.medicacion_actual || hospitalizacion.medicacion_actual,
          datosActualizados.notas || hospitalizacion.notas,
          datosActualizados.estado_paciente || hospitalizacion.estado_paciente,
          datosActualizados.fecha_prevista_alta || hospitalizacion.fecha_prevista_alta,
          id
        ], function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          getHospitalizacionById(id)
            .then(hospitalizacionActualizada => resolve(hospitalizacionActualizada))
            .catch(err => reject(err));
        });
      })
      .catch(err => reject(err));
  });
}

// Función para dar de alta a un paciente hospitalizado
function darAltaPaciente(id) {
  return new Promise(async (resolve, reject) => {
    try {
      // Primero obtenemos la hospitalización
      const hospitalizacion = await getHospitalizacionById(id);
      if (!hospitalizacion) {
        reject(new Error("Hospitalización no encontrada"));
        return;
      }
      
      // Actualizamos la hora de fin
      db.run(
        "UPDATE hospitalizaciones SET hora_fin = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          // Actualizamos el estado del paciente
          db.run(
            "UPDATE pacientes SET estado_actual = 'activo' WHERE id_paciente = ?",
            [hospitalizacion.id_paciente],
            function(err) {
              if (err) {
                reject(err);
                return;
              }
              
              resolve({ mensaje: "Paciente dado de alta correctamente" });
            }
          );
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

// ---- FUNCIONES PARA CONSULTAS ----

// Función para obtener todas las consultas
function getConsultas(id_clinica) {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT c.*, p.nombre as paciente_nombre, p.especie, p.raza,
             u.nombre as veterinario_nombre
      FROM consultas c
      JOIN pacientes p ON c.id_paciente = p.id_paciente
      LEFT JOIN usuarios u ON c.id_veterinario = u.id
    `;
    
    const params = [];
    
    if (id_clinica) {
      query += " WHERE c.id_clinica = ?";
      params.push(id_clinica);
    }
    
    query += " ORDER BY c.fecha DESC";
    
    db.all(query, params, (err, consultas) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(consultas);
    });
  });
}

// Función para obtener consultas de un paciente
function getConsultasByPaciente(idPaciente) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.*, u.nombre as veterinario_nombre
      FROM consultas c
      LEFT JOIN usuarios u ON c.id_veterinario = u.id
      WHERE c.id_paciente = ?
      ORDER BY c.fecha DESC
    `;
    
    db.all(query, [idPaciente], (err, consultas) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(consultas);
    });
  });
}

// Función para crear una nueva consulta
function crearConsulta(consulta) {
  return new Promise(async (resolve, reject) => {
    try {
      // Verificar que existe el paciente
      const paciente = await getPacienteByIdPaciente(consulta.id_paciente);
      if (!paciente) {
        reject(new Error("El paciente no existe"));
        return;
      }
      
      // Actualizar el estado del paciente
      db.run(
        "UPDATE pacientes SET estado_actual = 'en consulta' WHERE id_paciente = ?",
        [consulta.id_paciente]
      );
      
      db.run(`
        INSERT INTO consultas (
          id_paciente, id_clinica, id_veterinario, motivo, tipo,
          diagnostico, tratamiento, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        consulta.id_paciente,
        consulta.id_clinica,
        consulta.id_veterinario,
        consulta.motivo || null,
        consulta.tipo || null,
        consulta.diagnostico || null,
        consulta.tratamiento || null,
        consulta.observaciones || null
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const consultaId = this.lastID;
        
        // Registrar en historial
        registrarEnHistorial(
          paciente.id_paciente,
          paciente.id_historial,
          'consulta',
          consultaId
        )
          .then(() => {
            db.get(
              "SELECT * FROM consultas WHERE id = ?",
              [consultaId],
              (err, nuevaConsulta) => {
                if (err) {
                  reject(err);
                  return;
                }
                resolve(nuevaConsulta);
              }
            );
          })
          .catch(err => reject(err));
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ---- FUNCIONES PARA HISTORIALES ----

// Función para registrar en historial
function registrarEnHistorial(idPaciente, idHistorial, tipoRegistro, idRegistro) {
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO historiales (
        id_paciente, id_historial, tipo_registro, id_registro
      ) VALUES (?, ?, ?, ?)
    `, [
      idPaciente,
      idHistorial,
      tipoRegistro,
      idRegistro
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
}

// Función para obtener historial de un paciente
function getHistorialPaciente(idPaciente) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM historiales WHERE id_paciente = ? ORDER BY fecha_registro DESC",
      [idPaciente],
      async (err, registros) => {
        if (err) {
          reject(err);
          return;
        }
        
        try {
          // Para cada registro, obtenemos el detalle según el tipo
          const historialesDetallados = [];
          
          for (const registro of registros) {
            let detalle = null;
            
            switch (registro.tipo_registro) {
              case 'consulta':
                detalle = await getConsultaById(registro.id_registro);
                break;
              case 'hospitalizacion':
                detalle = await getHospitalizacionById(registro.id_registro);
                break;
              case 'laboratorio':
                detalle = await getEstudioLaboratorioById(registro.id_registro);
                break;
            }
            
            historialesDetallados.push({
              ...registro,
              detalle
            });
          }
          
          resolve(historialesDetallados);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
}

// Función para obtener una consulta por ID
function getConsultaById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM consultas WHERE id = ?",
      [id],
      (err, consulta) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(consulta);
      }
    );
  });
}

// Obtener un estudio de laboratorio por ID
function getEstudioLaboratorioById(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, p.nombre as paciente_nombre, u.nombre as veterinario_nombre
      FROM estudios_laboratorio e
      JOIN pacientes p ON e.paciente_id = p.id
      LEFT JOIN usuarios u ON e.veterinario_id = u.id
      WHERE e.id = ?
    `;
    
    db.get(query, [id], (err, estudio) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(estudio);
    });
  });
}

// ---- FUNCIONES PARA ESTUDIOS DE LABORATORIO ----

// Inicializar tabla de estudios de laboratorio si no existe
db.run(`CREATE TABLE IF NOT EXISTS estudios_laboratorio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  id_clinica INTEGER NOT NULL,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  tipo TEXT NOT NULL,
  resultados TEXT,
  observaciones TEXT,
  veterinario_id INTEGER,
  estado TEXT DEFAULT 'pendiente',
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (veterinario_id) REFERENCES usuarios(id),
  FOREIGN KEY (id_clinica) REFERENCES clinicas(id)
)`);

// Obtener todos los estudios de laboratorio de una clínica
function getEstudiosLaboratorio(id_clinica) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, p.nombre as paciente_nombre, u.nombre as veterinario_nombre
      FROM estudios_laboratorio e
      JOIN pacientes p ON e.paciente_id = p.id
      LEFT JOIN usuarios u ON e.veterinario_id = u.id
      WHERE e.id_clinica = ?
      ORDER BY e.fecha DESC
    `;
    
    db.all(query, [id_clinica], (err, estudios) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(estudios);
    });
  });
}

// Obtener estudios de laboratorio por paciente
function getEstudiosLaboratorioPorPaciente(pacienteId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT e.*, u.nombre as veterinario_nombre
      FROM estudios_laboratorio e
      LEFT JOIN usuarios u ON e.veterinario_id = u.id
      WHERE e.paciente_id = ?
      ORDER BY e.fecha DESC
    `;
    
    db.all(query, [pacienteId], (err, estudios) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(estudios);
    });
  });
}

// Crear un nuevo estudio de laboratorio
function crearEstudioLaboratorio(estudio) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO estudios_laboratorio (
        paciente_id, id_clinica, tipo, resultados, observaciones, veterinario_id, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      estudio.paciente_id,
      estudio.id_clinica,
      estudio.tipo,
      estudio.resultados || null,
      estudio.observaciones || null,
      estudio.veterinario_id,
      estudio.estado || 'pendiente'
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      const estudioId = this.lastID;
      
      // Registrar en el historial del paciente
      registrarEnHistorial(estudio.paciente_id, null, 'estudio_laboratorio', estudioId)
        .then(() => {
          getEstudioLaboratorioById(estudioId)
            .then(nuevoEstudio => resolve(nuevoEstudio))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  });
}

// Actualizar un estudio de laboratorio
function actualizarEstudioLaboratorio(id, estudioActualizado) {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE estudios_laboratorio SET
        tipo = COALESCE(?, tipo),
        resultados = COALESCE(?, resultados),
        observaciones = COALESCE(?, observaciones),
        veterinario_id = COALESCE(?, veterinario_id),
        estado = COALESCE(?, estado)
      WHERE id = ?
    `;
    
    db.run(query, [
      estudioActualizado.tipo || null,
      estudioActualizado.resultados || null,
      estudioActualizado.observaciones || null,
      estudioActualizado.veterinario_id || null,
      estudioActualizado.estado || null,
      id
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      if (this.changes === 0) {
        reject(new Error('Estudio de laboratorio no encontrado'));
        return;
      }
      
      getEstudioLaboratorioById(id)
        .then(estudio => resolve(estudio))
        .catch(err => reject(err));
    });
  });
}

// ---- FUNCIONES PARA INVENTARIO Y COMPRAS ----

// Inicializar tablas de inventario y compras si no existen
db.run(`CREATE TABLE IF NOT EXISTS inventario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_clinica INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  cantidad INTEGER DEFAULT 0,
  precio_compra REAL,
  precio_venta REAL,
  categoria TEXT,
  unidad_medida TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_clinica) REFERENCES clinicas(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS compras (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_clinica INTEGER NOT NULL,
  proveedor TEXT,
  numero_factura TEXT,
  fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
  total REAL,
  estado TEXT DEFAULT 'completada',
  notas TEXT,
  usuario_id INTEGER,
  FOREIGN KEY (id_clinica) REFERENCES clinicas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
)`);

db.run(`CREATE TABLE IF NOT EXISTS compra_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  compra_id INTEGER NOT NULL,
  producto_id INTEGER,
  nombre_producto TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_unitario REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (compra_id) REFERENCES compras(id),
  FOREIGN KEY (producto_id) REFERENCES inventario(id)
)`);

// Obtener todo el inventario de una clínica
function getInventario(id_clinica) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM inventario
      WHERE id_clinica = ?
      ORDER BY nombre
    `;
    
    db.all(query, [id_clinica], (err, productos) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(productos);
    });
  });
}

// Obtener un producto del inventario por ID
function getProductoById(id) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM inventario WHERE id = ?`;
    
    db.get(query, [id], (err, producto) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(producto);
    });
  });
}

// Crear o actualizar un producto en el inventario
function actualizarInventario(producto) {
  return new Promise((resolve, reject) => {
    // Si tiene ID, actualizamos el producto existente
    if (producto.id) {
      const queryUpdate = `
        UPDATE inventario SET
          nombre = COALESCE(?, nombre),
          descripcion = COALESCE(?, descripcion),
          cantidad = COALESCE(?, cantidad),
          precio_compra = COALESCE(?, precio_compra),
          precio_venta = COALESCE(?, precio_venta),
          categoria = COALESCE(?, categoria),
          unidad_medida = COALESCE(?, unidad_medida),
          fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(queryUpdate, [
        producto.nombre || null,
        producto.descripcion || null,
        producto.cantidad || null,
        producto.precio_compra || null,
        producto.precio_venta || null,
        producto.categoria || null,
        producto.unidad_medida || null,
        producto.id
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        if (this.changes === 0) {
          reject(new Error('Producto no encontrado'));
          return;
        }
        
        getProductoById(producto.id)
          .then(productoActualizado => resolve(productoActualizado))
          .catch(err => reject(err));
      });
    } else {
      // Si no tiene ID, creamos un nuevo producto
      const queryInsert = `
        INSERT INTO inventario (
          id_clinica, nombre, descripcion, cantidad, precio_compra, precio_venta, 
          categoria, unidad_medida
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(queryInsert, [
        producto.id_clinica,
        producto.nombre,
        producto.descripcion || null,
        producto.cantidad || 0,
        producto.precio_compra || null,
        producto.precio_venta || null,
        producto.categoria || null,
        producto.unidad_medida || null
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        getProductoById(this.lastID)
          .then(nuevoProducto => resolve(nuevoProducto))
          .catch(err => reject(err));
      });
    }
  });
}

// Obtener todas las compras de una clínica
function getCompras(id_clinica) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.*, u.nombre as usuario_nombre
      FROM compras c
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id_clinica = ?
      ORDER BY c.fecha DESC
    `;
    
    db.all(query, [id_clinica], (err, compras) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Para cada compra, obtenemos sus items
      const promises = compras.map(compra => {
        return new Promise((resolveItems, rejectItems) => {
          db.all(
            "SELECT * FROM compra_items WHERE compra_id = ?",
            [compra.id],
            (err, items) => {
              if (err) {
                rejectItems(err);
                return;
              }
              compra.items = items;
              resolveItems(compra);
            }
          );
        });
      });
      
      Promise.all(promises)
        .then(comprasConItems => resolve(comprasConItems))
        .catch(err => reject(err));
    });
  });
}

// Obtener una compra por ID
function getCompraById(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.*, u.nombre as usuario_nombre
      FROM compras c
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.id = ?
    `;
    
    db.get(query, [id], (err, compra) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!compra) {
        resolve(null);
        return;
      }
      
      // Obtenemos los items de la compra
      db.all(
        "SELECT ci.*, i.nombre as nombre_producto_actual FROM compra_items ci LEFT JOIN inventario i ON ci.producto_id = i.id WHERE ci.compra_id = ?",
        [compra.id],
        (err, items) => {
          if (err) {
            reject(err);
            return;
          }
          compra.items = items;
          resolve(compra);
        }
      );
    });
  });
}

// Crear una nueva compra y actualizar inventario
function crearCompra(compra) {
  return new Promise((resolve, reject) => {
    // Primero creamos la compra
    const queryCompra = `
      INSERT INTO compras (
        id_clinica, proveedor, numero_factura, total, estado, notas, usuario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(queryCompra, [
      compra.id_clinica,
      compra.proveedor || null,
      compra.numero_factura || null,
      compra.total,
      compra.estado || 'completada',
      compra.notas || null,
      compra.usuario_id
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      const compraId = this.lastID;
      
      // Ahora insertamos los items de la compra
      if (!compra.items || compra.items.length === 0) {
        getCompraById(compraId)
          .then(nuevaCompra => resolve(nuevaCompra))
          .catch(err => reject(err));
        return;
      }
      
      const queryItem = `
        INSERT INTO compra_items (
          compra_id, producto_id, nombre_producto, cantidad, precio_unitario, subtotal
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const stmt = db.prepare(queryItem);
      const promisesItems = [];
      
      for (const item of compra.items) {
        promisesItems.push(
          new Promise((resolveInsert, rejectInsert) => {
            stmt.run([
              compraId,
              item.producto_id || null,
              item.nombre_producto,
              item.cantidad,
              item.precio_unitario,
              item.subtotal
            ], function(err) {
              if (err) rejectInsert(err);
              else resolveInsert();
            });
          })
        );
      }
      
      Promise.all(promisesItems)
        .then(() => {
          stmt.finalize();
          
          // Ahora actualizamos el inventario para cada item
          const promisesInventario = [];
          
          for (const item of compra.items) {
            // Si el producto ya existe en el inventario
            if (item.producto_id) {
              promisesInventario.push(
                new Promise((resolveUpdate, rejectUpdate) => {
                  // Primero obtenemos el producto actual
                  getProductoById(item.producto_id)
                    .then(producto => {
                      if (!producto) {
                        resolveUpdate(); // Si no existe, simplemente continuamos
                        return;
                      }
                      
                      // Actualizamos cantidad y precio de compra
                      const nuevaCantidad = producto.cantidad + item.cantidad;
                      actualizarInventario({
                        id: item.producto_id,
                        cantidad: nuevaCantidad,
                        precio_compra: item.precio_unitario
                      })
                        .then(() => resolveUpdate())
                        .catch(err => rejectUpdate(err));
                    })
                    .catch(err => rejectUpdate(err));
                })
              );
            } else {
              // Si es un producto nuevo, lo añadimos al inventario
              promisesInventario.push(
                new Promise((resolveCreate, rejectCreate) => {
                  actualizarInventario({
                    id_clinica: compra.id_clinica,
                    nombre: item.nombre_producto,
                    cantidad: item.cantidad,
                    precio_compra: item.precio_unitario,
                    // Sugerimos un precio de venta con 30% de margen por defecto
                    precio_venta: item.precio_unitario * 1.3
                  })
                    .then(nuevoProducto => {
                      // Actualizamos el item de compra con el ID del producto creado
                      db.run(
                        "UPDATE compra_items SET producto_id = ? WHERE compra_id = ? AND nombre_producto = ?",
                        [nuevoProducto.id, compraId, item.nombre_producto],
                        err => {
                          if (err) rejectCreate(err);
                          else resolveCreate();
                        }
                      );
                    })
                    .catch(err => rejectCreate(err));
                })
              );
            }
          }
          
          Promise.all(promisesInventario)
            .then(() => {
              getCompraById(compraId)
                .then(nuevaCompra => resolve(nuevaCompra))
                .catch(err => reject(err));
            })
            .catch(err => reject(err));
        })
        .catch(err => {
          stmt.finalize();
          reject(err);
        });
    });
  });
}

// Inicializar la base de datos con el superusuario
function initializeDatabase() {
  db.serialize(() => {
    // Creamos todas las tablas necesarias...
    
    // Verificar si hay un superusuario
    db.get("SELECT COUNT(*) as count FROM usuarios WHERE tipo_usuario = 'SUPERUSUARIO'", [], (err, row) => {
      if (err) {
        console.error('Error al verificar superusuario:', err.message);
        return;
      }
      
      if (row.count === 0) {
        // Crear superusuario por defecto
        const superusuario = {
          id_clinica: 0, // El superusuario tiene id_clinica = 0
          email: 'super@sistema.com',
          password: 'super123', // En producción, usar contraseñas más seguras
          nombre: 'Superusuario',
          tipo_usuario: 'SUPERUSUARIO'
        };
        
        crearUsuario(superusuario)
          .then(() => {
            console.log('Superusuario creado correctamente');
          })
          .catch(err => {
            console.error('Error al crear superusuario:', err.message);
          });
      }
      
      console.log('Base de datos inicializada correctamente');
    });
  });
}

// Llamamos a la función de inicialización
initializeDatabase();

// ---- EXPORTAR FUNCIONES ----

module.exports = {
  // Conexión a la base de datos
  db,
  
  // Funciones para usuarios
  verificarCredenciales,
  getUsuarioById,
  crearUsuario,
  getUsuarios,
  
  // Funciones para clínicas
  getClinicas,
  getClinicaById,
  crearClinica,
  
  // Funciones para propietarios
  getPropietarios,
  getPropietarioById,
  crearPropietario,
  
  // Funciones para pacientes
  getPacientes,
  getPacienteById,
  getPacienteByIdPaciente,
  crearPaciente,
  
  // Funciones para hospitalizaciones
  getPacientesHospitalizados,
  getHospitalizacionById,
  crearHospitalizacion,
  actualizarHospitalizacion,
  darAltaPaciente,
  
  // Funciones para consultas
  getConsultas,
  getConsultasByPaciente,
  crearConsulta,
  
  // Funciones para historiales
  getHistorialPaciente,
  registrarEnHistorial,
  
  // Funciones para estudios de laboratorio
  getEstudiosLaboratorio,
  getEstudiosLaboratorioPorPaciente,
  crearEstudioLaboratorio,
  actualizarEstudioLaboratorio,
  getEstudioLaboratorioById,
  
  // Funciones para inventario y compras
  getInventario,
  getProductoById,
  actualizarInventario,
  getCompras,
  getCompraById,
  crearCompra
}; 