require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rutasSalidas = require('./routes/salidas');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/error-handler');

const app = express();
const puerto = process.env.PORT || 3000;

const origenesPermitidos = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

app.use(cors({
  origin: origenesPermitidos.length ? origenesPermitidos : true,
}));
app.use(logger);
app.use(express.json());
app.use('/api', rutasSalidas);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ error: true, mensaje: 'Ruta no encontrada' });
});

app.use(errorHandler);

app.listen(puerto, () => {
  console.log(`Servidor ejecutándose en http://localhost:${puerto}`);
});
