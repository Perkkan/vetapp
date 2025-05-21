const express = require('express');
const app = express();
const PORT = 3030;

app.get('/', (req, res) => {
    res.json({ message: 'Servidor de prueba funcionando correctamente' });
});

app.listen(PORT, () => {
    console.log(`Servidor de prueba ejecutándose en http://localhost:${PORT}`);
}); 