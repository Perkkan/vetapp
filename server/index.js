require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const { testConnection } = require('./config/database');
const propietariosController = require('./controllers/propietariosController');
const inventarioController = require('./controllers/inventarioController');
const facturacionController = require('./controllers/facturacionController');
const pacientesController = require('./controllers/pacientesController');
const historialesController = require('./controllers/historialesController');
const salaEsperaController = require('./controllers/salaEsperaController');
const clinicasController = require('./controllers/clinicasController');
const usuariosController = require('./controllers/usuariosController');
const notificacionesController = require('./controllers/notificacionesController');
const permisosController = require('./controllers/permisosController');
const authRoutes = require('./routes/auth'); // This will be made redundant by mainApiRoutes
const mainApiRoutes = require('./routes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del Sistema de Administración de Clínicas Veterinarias' });
});

// Montar todas las rutas de la API bajo /api
// Esto incluye las rutas de autenticación que están definidas dentro de mainApiRoutes (./routes/index.js)
app.use('/api', mainApiRoutes);

// Iniciar servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos. Verificar configuración.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer(); 