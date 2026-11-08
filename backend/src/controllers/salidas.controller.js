const fs = require('node:fs/promises');
const path = require('node:path');

const archivoSalidas = path.join(__dirname, '..', 'data', 'salidas.json');
const tiposPermitidos = ['lancha', 'rapido', 'deslizador'];

async function leerSalidas() {
  const contenido = await fs.readFile(archivoSalidas, 'utf8');
  return JSON.parse(contenido);
}

async function guardarSalidas(salidas) {
  await fs.writeFile(archivoSalidas, `${JSON.stringify(salidas, null, 2)}\n`, 'utf8');
}

function validarSalida(body, { esNuevo = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return 'El cuerpo de la solicitud debe ser un objeto';
  }

  for (const campo of ['empresa', 'embarcacion', 'destino', 'puerto', 'fechaHora']) {
    if (typeof body[campo] !== 'string' || !body[campo].trim()) {
      return `El campo ${campo} es obligatorio`;
    }
  }

  if (!tiposPermitidos.includes(body.tipo)) {
    return 'El tipo debe ser lancha, rapido o deslizador';
  }

  if (typeof body.precio !== 'number' || !Number.isFinite(body.precio) || body.precio <= 0) {
    return 'El precio debe ser un número mayor que 0';
  }

  if (Number.isNaN(Date.parse(body.fechaHora))) {
    return 'La fechaHora debe ser una fecha válida en formato ISO 8601';
  }

  if (esNuevo && new Date(body.fechaHora) < new Date()) {
    return 'La fechaHora no puede estar en el pasado';
  }

  if (
    typeof body.duracionHoras !== 'number' ||
    !Number.isFinite(body.duracionHoras) ||
    body.duracionHoras <= 0
  ) {
    return 'La duracionHoras debe ser un número mayor que 0';
  }

  if (!Number.isInteger(body.cupos) || body.cupos < 0) {
    return 'Los cupos deben ser un número entero igual o mayor que 0';
  }

  return null;
}

function obtenerId(parametro) {
  const id = Number(parametro);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function listarSalidas(req, res, next) {
  try {
    const { destino, fecha, tipo } = req.query;
    let salidas = await leerSalidas();

    if (destino) {
      salidas = salidas.filter(
        (salida) => salida.destino.toLowerCase() === destino.toLowerCase(),
      );
    }
    if (fecha) {
      salidas = salidas.filter((salida) => salida.fechaHora.startsWith(fecha));
    }
    if (tipo) {
      salidas = salidas.filter((salida) => salida.tipo === tipo);
    }

    salidas.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
    res.json(salidas);
  } catch (error) {
    next(error);
  }
}

async function obtenerSalida(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const salidas = await leerSalidas();
    const salida = salidas.find((item) => item.id === id);

    if (!salida) {
      return res.status(404).json({ error: 'Salida no encontrada' });
    }

    return res.json(salida);
  } catch (error) {
    return next(error);
  }
}

async function crearSalida(req, res, next) {
  try {
    const errorValidacion = validarSalida(req.body, { esNuevo: true });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const salidas = await leerSalidas();
    const id = salidas.reduce((maximo, salida) => Math.max(maximo, salida.id), 0) + 1;
    const { id: _ignorado, ...datos } = req.body;
    const salida = { ...datos, id };
    salidas.push(salida);
    await guardarSalidas(salidas);

    return res.status(201).json(salida);
  } catch (error) {
    return next(error);
  }
}

async function actualizarSalida(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const errorValidacion = validarSalida(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const salidas = await leerSalidas();
    const indice = salidas.findIndex((salida) => salida.id === id);
    if (indice === -1) {
      return res.status(404).json({ error: 'Salida no encontrada' });
    }

    const { id: _ignorado, ...datos } = req.body;
    const salida = { ...datos, id };
    salidas[indice] = salida;
    await guardarSalidas(salidas);
    return res.json(salida);
  } catch (error) {
    return next(error);
  }
}

async function eliminarSalida(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const salidas = await leerSalidas();
    const salidasRestantes = salidas.filter((salida) => salida.id !== id);

    if (salidasRestantes.length === salidas.length) {
      return res.status(404).json({ error: 'Salida no encontrada' });
    }

    await guardarSalidas(salidasRestantes);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function listarDestinos(req, res, next) {
  try {
    const salidas = await leerSalidas();
    const destinos = [...new Set(salidas.map((salida) => salida.destino))].sort();
    return res.json(destinos);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarSalidas,
  obtenerSalida,
  crearSalida,
  actualizarSalida,
  eliminarSalida,
  listarDestinos,
};
