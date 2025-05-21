const PORT = process.env.PORT || 5000;
const { testConnection, exec } = require('./config/database');
const propietariosController = require('./controllers/propietariosController'); 