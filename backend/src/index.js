const express = require('express');
const cors = require('cors');
const rutasSalidas = require('./routes/salidas');

const app = express();
const puerto = process.env.PORT || 3000;

const origenesPermitidos = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

app.use(cors({
  origin: origenesPermitidos.length ? origenesPermitidos : true,
}));
app.use(express.json());
app.use('/api', rutasSalidas);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'El cuerpo JSON no es válido' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(puerto, () => {
  console.log(`Servidor ejecutándose en http://localhost:${puerto}`);
});
