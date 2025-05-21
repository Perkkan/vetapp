const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { ROLES, PERMISOS } = require('./permisos');

// Configurar la ruta de la base de datos
const dbPath = path.join(__dirname, 'database/veterinaria.sqlite');
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
    initializeDatabase();
  }
});

// Función para inicializar la base de datos
function initializeDatabase() {
  db.serialize(() => {
    // Tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      rol TEXT NOT NULL,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de permisos de usuario
    db.run(`CREATE TABLE IF NOT EXISTS usuario_permisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      permiso TEXT NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )`);

    // Tabla de pacientes
    db.run(`CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      especie TEXT,
      raza TEXT,
      sexo TEXT,
      peso REAL,
      fecha_nacimiento DATE,
      propietario_id INTEGER,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de propietarios
    db.run(`CREATE TABLE IF NOT EXISTS propietarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      direccion TEXT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabla de sala de espera
    db.run(`CREATE TABLE IF NOT EXISTS sala_espera (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER,
      estado TEXT DEFAULT 'espera',
      hora_llegada DATETIME DEFAULT CURRENT_TIMESTAMP,
      hora_inicio_consulta DATETIME,
      hora_fin_consulta DATETIME,
      motivo TEXT,
      prioridad TEXT DEFAULT 'normal',
      veterinario_id INTEGER,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY (veterinario_id) REFERENCES usuarios(id)
    )`);

    // Tabla de hospitalizaciones
    db.run(`CREATE TABLE IF NOT EXISTS hospitalizaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER,
      hora_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
      hora_fin DATETIME,
      motivo TEXT,
      procedimientos_realizados TEXT,
      medicacion_actual TEXT,
      notas TEXT,
      estado_paciente TEXT,
      fecha_prevista_alta DATETIME,
      veterinario_id INTEGER,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY (veterinario_id) REFERENCES usuarios(id)
    )`);

    // Tabla de historiales médicos
    db.run(`CREATE TABLE IF NOT EXISTS historiales_medicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      tipo TEXT,
      diagnostico TEXT,
      tratamiento TEXT,
      observaciones TEXT,
      veterinario_id INTEGER,
      FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
      FOREIGN KEY (veterinario_id) REFERENCES usuarios(id)
    )`);

    // Tabla de facturas
    db.run(`CREATE TABLE IF NOT EXISTS facturas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT UNIQUE,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      cliente_id INTEGER,
      subtotal REAL,
      iva REAL,
      total REAL,
      forma_pago TEXT,
      estado TEXT DEFAULT 'pendiente',
      FOREIGN KEY (cliente_id) REFERENCES propietarios(id)
    )`);

    // Tabla de items de facturas
    db.run(`CREATE TABLE IF NOT EXISTS factura_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      factura_id INTEGER,
      concepto TEXT,
      cantidad INTEGER,
      precio_unitario REAL,
      tipo_iva INTEGER,
      FOREIGN KEY (factura_id) REFERENCES facturas(id)
    )`);

    // Verificar si hay un usuario administrador
    db.get("SELECT COUNT(*) as count FROM usuarios WHERE rol = 'ADMINISTRADOR'", [], (err, row) => {
      if (err) {
        console.error('Error al verificar usuario administrador:', err.message);
        return;
      }
      
      console.log('Base de datos inicializada correctamente');
    });
  });
}

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
    db.run("INSERT INTO usuarios (email, password, nombre, rol) VALUES (?, ?, ?, ?)",
      [usuario.email, usuario.password, usuario.nombre, usuario.rol],
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        const usuarioId = this.lastID;
        
        // Obtener permisos según el rol
        let permisos = [];
        if (usuario.rol in ROLES) {
          permisos = ROLES[usuario.rol].permisos;
        }
        
        // Insertar permisos para el usuario
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
      }
    );
  });
}

// Función para obtener todos los usuarios
function getUsuarios() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM usuarios", async (err, usuarios) => {
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

// ---- FUNCIONES PARA PACIENTES ----

// Obtener todos los pacientes
function getPacientes() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.*, pr.nombre as propietario_nombre, pr.telefono as propietario_telefono 
      FROM pacientes p
      LEFT JOIN propietarios pr ON p.propietario_id = pr.id
    `;
    
    db.all(query, [], (err, pacientes) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(pacientes);
    });
  });
}

// Obtener un paciente por ID
function getPacienteById(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.*, pr.nombre as propietario_nombre, pr.telefono as propietario_telefono,
             pr.email as propietario_email, pr.direccion as propietario_direccion
      FROM pacientes p
      LEFT JOIN propietarios pr ON p.propietario_id = pr.id
      WHERE p.id = ?
    `;
    
    db.get(query, [id], (err, paciente) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(paciente);
    });
  });
}

// Crear un nuevo paciente
function crearPaciente(paciente) {
  return new Promise(async (resolve, reject) => {
    // Primero verificamos si necesitamos crear un propietario
    let propietarioId = paciente.propietario_id;
    
    if (!propietarioId && paciente.propietario_nombre) {
      try {
        propietarioId = await crearPropietario({
          nombre: paciente.propietario_nombre,
          telefono: paciente.propietario_telefono,
          email: paciente.propietario_email,
          direccion: paciente.propietario_direccion
        });
      } catch (error) {
        reject(error);
        return;
      }
    }
    
    const query = `
      INSERT INTO pacientes (
        nombre, especie, raza, sexo, peso, fecha_nacimiento, propietario_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      paciente.nombre,
      paciente.especie,
      paciente.raza,
      paciente.sexo,
      paciente.peso,
      paciente.fecha_nacimiento,
      propietarioId
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      getPacienteById(this.lastID)
        .then(nuevoPaciente => resolve(nuevoPaciente))
        .catch(err => reject(err));
    });
  });
}

// Crear un propietario
function crearPropietario(propietario) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO propietarios (nombre, telefono, email, direccion)
      VALUES (?, ?, ?, ?)
    `;
    
    db.run(query, [
      propietario.nombre,
      propietario.telefono,
      propietario.email,
      propietario.direccion
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
}

// ---- FUNCIONES PARA SALA DE ESPERA ----

// Obtener pacientes en sala de espera
function getPacientesEspera() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT s.*, p.nombre as paciente_nombre, p.especie, p.raza,
             pr.nombre as propietario_nombre, pr.telefono as propietario_telefono
      FROM sala_espera s
      JOIN pacientes p ON s.paciente_id = p.id
      LEFT JOIN propietarios pr ON p.propietario_id = pr.id
      WHERE s.estado = 'espera'
    `;
    
    db.all(query, [], (err, pacientes) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(pacientes);
    });
  });
}

// Obtener pacientes en consulta
function getPacientesConsulta() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT s.*, p.nombre as paciente_nombre, p.especie, p.raza,
             u.nombre as veterinario_nombre
      FROM sala_espera s
      JOIN pacientes p ON s.paciente_id = p.id
      LEFT JOIN usuarios u ON s.veterinario_id = u.id
      WHERE s.estado = 'consulta'
    `;
    
    db.all(query, [], (err, pacientes) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(pacientes);
    });
  });
}

// Obtener pacientes hospitalizados
function getPacientesHospitalizados() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT h.*, p.nombre as paciente_nombre, p.especie, p.raza,
             u.nombre as veterinario_nombre
      FROM hospitalizaciones h
      JOIN pacientes p ON h.paciente_id = p.id
      LEFT JOIN usuarios u ON h.veterinario_id = u.id
      WHERE h.hora_fin IS NULL
    `;
    
    db.all(query, [], (err, pacientes) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(pacientes);
    });
  });
}

// Obtener detalle de hospitalización
function getHospitalizacionById(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT h.*, p.nombre as paciente_nombre, p.especie, p.raza, p.sexo, p.peso,
             u.nombre as veterinario_nombre,
             pr.nombre as propietario_nombre, pr.telefono as propietario_telefono
      FROM hospitalizaciones h
      JOIN pacientes p ON h.paciente_id = p.id
      LEFT JOIN usuarios u ON h.veterinario_id = u.id
      LEFT JOIN propietarios pr ON p.propietario_id = pr.id
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

// ---- FUNCIONES PARA HISTORIALES MÉDICOS ----

// Obtener todos los historiales médicos
function getHistorialesMedicos() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT h.*, p.nombre as paciente_nombre, u.nombre as veterinario_nombre
      FROM historiales_medicos h
      JOIN pacientes p ON h.paciente_id = p.id
      LEFT JOIN usuarios u ON h.veterinario_id = u.id
      ORDER BY h.fecha DESC
    `;
    
    db.all(query, [], (err, historiales) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(historiales);
    });
  });
}

// Obtener historiales médicos de un paciente
function getHistorialesByPacienteId(pacienteId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT h.*, u.nombre as veterinario_nombre
      FROM historiales_medicos h
      LEFT JOIN usuarios u ON h.veterinario_id = u.id
      WHERE h.paciente_id = ?
      ORDER BY h.fecha DESC
    `;
    
    db.all(query, [pacienteId], (err, historiales) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(historiales);
    });
  });
}

// Crear un nuevo registro de historial médico
function crearHistorialMedico(historial) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO historiales_medicos (
        paciente_id, tipo, diagnostico, tratamiento, observaciones, veterinario_id
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.run(query, [
      historial.paciente_id,
      historial.tipo,
      historial.diagnostico,
      historial.tratamiento,
      historial.observaciones,
      historial.veterinario_id
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      db.get(
        "SELECT * FROM historiales_medicos WHERE id = ?",
        [this.lastID],
        (err, nuevoHistorial) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(nuevoHistorial);
        }
      );
    });
  });
}

// ---- FUNCIONES PARA FACTURAS ----

// Obtener todas las facturas
function getFacturas() {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT f.*, pr.nombre as cliente
      FROM facturas f
      LEFT JOIN propietarios pr ON f.cliente_id = pr.id
      ORDER BY f.fecha DESC
    `;
    
    db.all(query, [], (err, facturas) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Para cada factura, obtenemos sus items
      const promises = facturas.map(factura => {
        return new Promise((resolveItems, rejectItems) => {
          db.all(
            "SELECT * FROM factura_items WHERE factura_id = ?",
            [factura.id],
            (err, items) => {
              if (err) {
                rejectItems(err);
                return;
              }
              factura.items = items;
              resolveItems(factura);
            }
          );
        });
      });
      
      Promise.all(promises)
        .then(facturasConItems => resolve(facturasConItems))
        .catch(err => reject(err));
    });
  });
}

// Obtener una factura por ID
function getFacturaById(id) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT f.*, pr.nombre as cliente, pr.nif, pr.direccion
      FROM facturas f
      LEFT JOIN propietarios pr ON f.cliente_id = pr.id
      WHERE f.id = ?
    `;
    
    db.get(query, [id], (err, factura) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!factura) {
        resolve(null);
        return;
      }
      
      // Obtenemos los items de la factura
      db.all(
        "SELECT * FROM factura_items WHERE factura_id = ?",
        [factura.id],
        (err, items) => {
          if (err) {
            reject(err);
            return;
          }
          factura.items = items;
          resolve(factura);
        }
      );
    });
  });
}

// Crear una nueva factura
function crearFactura(factura) {
  return new Promise((resolve, reject) => {
    // Primero creamos la factura
    const queryFactura = `
      INSERT INTO facturas (
        numero, cliente_id, subtotal, iva, total, forma_pago, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(queryFactura, [
      factura.numero,
      factura.cliente_id,
      factura.subtotal,
      factura.iva,
      factura.total,
      factura.forma_pago,
      factura.estado || 'pendiente'
    ], function(err) {
      if (err) {
        reject(err);
        return;
      }
      
      const facturaId = this.lastID;
      
      // Ahora insertamos los items de la factura
      if (!factura.items || factura.items.length === 0) {
        getFacturaById(facturaId)
          .then(nuevaFactura => resolve(nuevaFactura))
          .catch(err => reject(err));
        return;
      }
      
      const queryItem = `
        INSERT INTO factura_items (
          factura_id, concepto, cantidad, precio_unitario, tipo_iva
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      const stmt = db.prepare(queryItem);
      const promises = [];
      
      for (const item of factura.items) {
        promises.push(
          new Promise((resolveInsert, rejectInsert) => {
            stmt.run([
              facturaId,
              item.concepto,
              item.cantidad,
              item.precio_unitario,
              item.tipo_iva
            ], function(err) {
              if (err) rejectInsert(err);
              else resolveInsert();
            });
          })
        );
      }
      
      Promise.all(promises)
        .then(() => {
          stmt.finalize();
          getFacturaById(facturaId)
            .then(nuevaFactura => resolve(nuevaFactura))
            .catch(err => reject(err));
        })
        .catch(err => {
          stmt.finalize();
          reject(err);
        });
    });
  });
}

module.exports = {
  db,
  verificarCredenciales,
  getUsuarioById,
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
}; 