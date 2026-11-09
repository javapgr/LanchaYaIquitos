const db = require('../db');

const tiposPermitidos = ['lancha', 'rapido', 'deslizador'];

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

function datosSalida(body) {
  const { id: _ignorado, ...datos } = body;
  return {
    empresa: datos.empresa.trim(),
    embarcacion: datos.embarcacion.trim(),
    tipo: datos.tipo,
    destino: datos.destino.trim(),
    puerto: datos.puerto.trim(),
    fechaHora: datos.fechaHora.trim(),
    duracionHoras: datos.duracionHoras,
    precio: datos.precio,
    cupos: datos.cupos,
  };
}

function listarSalidas(req, res, next) {
  try {
    const { destino, fecha, tipo, q } = req.query;
    const condiciones = [];
    const valores = [];

    if (destino) {
      condiciones.push('LOWER(destino) = LOWER(?)');
      valores.push(destino);
    }
    if (fecha) {
      condiciones.push('fechaHora LIKE ?');
      valores.push(`${fecha}%`);
    }
    if (tipo) {
      condiciones.push('tipo = ?');
      valores.push(tipo);
    }
    if (q) {
      condiciones.push('(LOWER(empresa) LIKE ? OR LOWER(embarcacion) LIKE ?)');
      const texto = `%${String(q).trim().toLowerCase()}%`;
      valores.push(texto, texto);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const salidas = db.prepare(`
      SELECT id, empresa, embarcacion, tipo, destino, puerto, fechaHora, duracionHoras, precio, cupos
      FROM salidas
      ${where}
      ORDER BY fechaHora ASC
    `).all(...valores);

    return res.json(salidas);
  } catch (error) {
    return next(error);
  }
}

function obtenerSalida(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const salida = db.prepare(`
      SELECT id, empresa, embarcacion, tipo, destino, puerto, fechaHora, duracionHoras, precio, cupos
      FROM salidas
      WHERE id = ?
    `).get(id);

    if (!salida) {
      return res.status(404).json({ error: 'Salida no encontrada' });
    }

    return res.json(salida);
  } catch (error) {
    return next(error);
  }
}

function crearSalida(req, res, next) {
  try {
    const errorValidacion = validarSalida(req.body, { esNuevo: true });
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const datos = datosSalida(req.body);
    const resultado = db.prepare(`
      INSERT INTO salidas (
        empresa, embarcacion, tipo, destino, puerto, fechaHora, duracionHoras, precio, cupos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      datos.empresa,
      datos.embarcacion,
      datos.tipo,
      datos.destino,
      datos.puerto,
      datos.fechaHora,
      datos.duracionHoras,
      datos.precio,
      datos.cupos,
    );

    const salida = db.prepare(`
      SELECT id, empresa, embarcacion, tipo, destino, puerto, fechaHora, duracionHoras, precio, cupos
      FROM salidas
      WHERE id = ?
    `).get(resultado.lastInsertRowid);

    return res.status(201).json(salida);
  } catch (error) {
    return next(error);
  }
}

function actualizarSalida(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const errorValidacion = validarSalida(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: errorValidacion });
    }

    const existente = db.prepare('SELECT id FROM salidas WHERE id = ?').get(id);
    if (!existente) {
      return res.status(404).json({ error: 'Salida no encontrada' });
    }

    const datos = datosSalida(req.body);
    db.prepare(`
      UPDATE salidas SET
        empresa = ?,
        embarcacion = ?,
        tipo = ?,
        destino = ?,
        puerto = ?,
        fechaHora = ?,
        duracionHoras = ?,
        precio = ?,
        cupos = ?
      WHERE id = ?
    `).run(
      datos.empresa,
      datos.embarcacion,
      datos.tipo,
      datos.destino,
      datos.puerto,
      datos.fechaHora,
      datos.duracionHoras,
      datos.precio,
      datos.cupos,
      id,
    );

    const salida = db.prepare(`
      SELECT id, empresa, embarcacion, tipo, destino, puerto, fechaHora, duracionHoras, precio, cupos
      FROM salidas
      WHERE id = ?
    `).get(id);

    return res.json(salida);
  } catch (error) {
    return next(error);
  }
}

function eliminarSalida(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const resultado = db.prepare('DELETE FROM salidas WHERE id = ?').run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({ error: 'Salida no encontrada' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

function listarDestinos(req, res, next) {
  try {
    const filas = db.prepare(`
      SELECT DISTINCT destino
      FROM salidas
      ORDER BY destino ASC
    `).all();
    return res.json(filas.map((fila) => fila.destino));
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
