const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 5000;

// Configurar SQLite
const dbPath = path.join(__dirname, 'database/veterinaria.sqlite');
console.log('Ruta de la base de datos SQLite:', dbPath);

// Asegurar que el directorio existe
const dbDir = path.dirname(dbPath);
if (!require('fs').existsSync(dbDir)) {
  require('fs').mkdirSync(dbDir, { recursive: true });
  console.log(`Directorio creado: ${dbDir}`);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar a la base de datos SQLite:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite');
    // Crear tablas básicas si no existen
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS sala_espera (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER,
        estado TEXT,
        hora_llegada DATETIME,
        hora_inicio_consulta DATETIME,
        hora_hospitalizacion DATETIME,
        motivo TEXT,
        motivo_hospitalizacion TEXT,
        prioridad TEXT,
        veterinario_id INTEGER,
        procedimientos_realizados TEXT,
        medicacion_actual TEXT,
        notas_hospitalizacion TEXT,
        estado_paciente TEXT,
        fecha_prevista_alta DATETIME
      )`);
    });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Administración de Clínicas Veterinarias (SQLite)' });
});

// Ruta de autenticación de prueba
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Credenciales de prueba
  if (email === 'admin@veterinaria.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'mock-jwt-token-admin',
      user: {
        id: 1,
        nombre: 'Administrador',
        email: 'admin@veterinaria.com',
        rol: 'admin',
        clinica_id: 1
      }
    });
  } else {
    res.status(401).json({
      success: false,
      mensaje: 'Credenciales inválidas'
    });
  }
});

// Rutas de sala de espera
app.get('/api/sala-espera/espera', (req, res) => {
  // Datos de prueba
  res.json([
    {
      id: 1,
      paciente_id: 1,
      paciente_nombre: 'Firulais',
      propietario_nombre: 'Juan Pérez',
      propietario_telefono: '555-1234',
      especie: 'Perro',
      raza: 'Labrador',
      motivo: 'Vacunación',
      hora_llegada: new Date(Date.now() - 30*60000),
      prioridad: 'normal'
    },
    {
      id: 2,
      paciente_id: 2,
      paciente_nombre: 'Michu',
      propietario_nombre: 'María González',
      propietario_telefono: '555-5678',
      especie: 'Gato',
      raza: 'Siamés',
      motivo: 'Vómitos',
      hora_llegada: new Date(Date.now() - 15*60000),
      prioridad: 'alta'
    }
  ]);
});

app.get('/api/sala-espera/consulta', (req, res) => {
  // Datos de prueba
  res.json([
    {
      id: 3,
      paciente_id: 3,
      paciente_nombre: 'Rocky',
      especie: 'Perro',
      raza: 'Bulldog',
      motivo: 'Cojera',
      hora_llegada: new Date(Date.now() - 60*60000),
      hora_inicio_consulta: new Date(Date.now() - 20*60000),
      veterinario_id: 1,
      veterinario_nombre: 'Dr. Martínez'
    }
  ]);
});

app.get('/api/sala-espera/hospitalizados', (req, res) => {
  // Datos de prueba
  res.json([
    {
      id: 4,
      paciente_id: 4,
      paciente_nombre: 'Luna',
      especie: 'Perro',
      raza: 'Pastor Alemán',
      motivo_hospitalizacion: 'Cirugía ortopédica',
      hora_llegada: new Date(Date.now() - 24*60*60000),
      hora_hospitalizacion: new Date(Date.now() - 20*60*60000),
      fecha_prevista_alta: new Date(Date.now() + 48*60*60000),
      estado_paciente: 'Estable',
      veterinario_id: 2,
      veterinario_nombre: 'Dra. Rodríguez'
    },
    {
      id: 5,
      paciente_id: 5,
      paciente_nombre: 'Simba',
      especie: 'Gato',
      raza: 'Persa',
      motivo_hospitalizacion: 'Infección urinaria',
      hora_llegada: new Date(Date.now() - 12*60*60000),
      hora_hospitalizacion: new Date(Date.now() - 10*60*60000),
      fecha_prevista_alta: new Date(Date.now() + 24*60*60000),
      estado_paciente: 'En tratamiento',
      veterinario_id: 1,
      veterinario_nombre: 'Dr. Martínez'
    }
  ]);
});

app.get('/api/sala-espera/hospitalizados/:id', (req, res) => {
  const { id } = req.params;
  
  // Datos de prueba
  if (id === '4') {
    res.json({
      id: 4,
      paciente_id: 4,
      paciente_nombre: 'Luna',
      especie: 'Perro',
      raza: 'Pastor Alemán',
      sexo: 'Hembra',
      peso: 28.5,
      motivo: 'Fractura en pata trasera',
      motivo_hospitalizacion: 'Cirugía ortopédica',
      hora_llegada: new Date(Date.now() - 24*60*60000),
      hora_hospitalizacion: new Date(Date.now() - 20*60*60000),
      fecha_prevista_alta: new Date(Date.now() + 48*60*60000),
      procedimientos_realizados: 'Cirugía de fractura de tibia. Colocación de placa ortopédica.',
      medicacion_actual: 'Antibióticos IV, analgésicos, antiinflamatorios',
      notas_hospitalizacion: 'Paciente recuperándose bien de la cirugía. Mantener reposo absoluto.',
      estado_paciente: 'Estable',
      propietario_id: 4,
      propietario_nombre: 'Roberto Sánchez',
      propietario_telefono: '555-9876',
      veterinario_id: 2,
      veterinario_nombre: 'Dra. Rodríguez'
    });
  } else if (id === '5') {
    res.json({
      id: 5,
      paciente_id: 5,
      paciente_nombre: 'Simba',
      especie: 'Gato',
      raza: 'Persa',
      sexo: 'Macho',
      peso: 4.2,
      motivo: 'Dificultad para orinar',
      motivo_hospitalizacion: 'Infección urinaria',
      hora_llegada: new Date(Date.now() - 12*60*60000),
      hora_hospitalizacion: new Date(Date.now() - 10*60*60000),
      fecha_prevista_alta: new Date(Date.now() + 24*60*60000),
      procedimientos_realizados: 'Sondaje uretral. Extracción de muestra para cultivo.',
      medicacion_actual: 'Antibióticos IV, analgésicos, fluidoterapia',
      notas_hospitalizacion: 'Paciente con mejoría en la micción. Continuar monitoreo de producción de orina.',
      estado_paciente: 'En tratamiento',
      propietario_id: 5,
      propietario_nombre: 'Carla Moreno',
      propietario_telefono: '555-4321',
      veterinario_id: 1,
      veterinario_nombre: 'Dr. Martínez'
    });
  } else {
    return res.status(404).json({ message: 'Paciente hospitalizado no encontrado' });
  }
});

// Ruta para agregar un paciente a sala de espera (solo simulación)
app.post('/api/sala-espera', (req, res) => {
  const { paciente_id, motivo, prioridad = 'normal' } = req.body;
  
  res.status(201).json({
    id: 6,
    paciente_id,
    estado: 'espera',
    hora_llegada: new Date(),
    motivo,
    prioridad,
    message: 'Paciente agregado a sala de espera'
  });
});

// Ruta para mover paciente a consulta (solo simulación)
app.put('/api/sala-espera/:id/consulta', (req, res) => {
  res.json({ message: 'Paciente movido a consulta exitosamente' });
});

// Ruta para mover paciente a hospitalización (solo simulación)
app.put('/api/sala-espera/:id/hospitalizacion', (req, res) => {
  res.json({ message: 'Paciente hospitalizado exitosamente' });
});

// Ruta para actualizar hospitalización (solo simulación)
app.put('/api/sala-espera/:id/hospitalizacion/actualizar', (req, res) => {
  res.json({ message: 'Información de hospitalización actualizada exitosamente' });
});

// Ruta para actualizar prioridad (solo simulación)
app.put('/api/sala-espera/:id/prioridad', (req, res) => {
  res.json({ message: 'Prioridad actualizada exitosamente' });
});

// Ruta para finalizar atención (solo simulación)
app.delete('/api/sala-espera/:id', (req, res) => {
  res.json({ message: 'Atención finalizada exitosamente' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor (versión SQLite) ejecutándose en http://localhost:${PORT}`);
}); 