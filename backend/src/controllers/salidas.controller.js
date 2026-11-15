const db = require('../db');
const { datosSalida, obtenerId, validarSalida } = require('../validators');

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
      condiciones.push('(LOWER(e.razonSocial) LIKE ? OR LOWER(s.embarcacion) LIKE ?)');
      const texto = `%${String(q).trim().toLowerCase()}%`;
      valores.push(texto, texto);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const salidas = db.prepare(`
      SELECT
        s.id, s.empresaId, e.razonSocial AS empresa, s.embarcacion, s.tipo,
        s.destino, s.puerto, s.fechaHora, s.duracionHoras, s.precio,
        s.capacidad, s.cupos
      FROM salidas s
      JOIN empresas e ON e.id = s.empresaId
      ${where}
      ORDER BY s.fechaHora ASC
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
      SELECT
        s.id, s.empresaId, e.razonSocial AS empresa, s.embarcacion, s.tipo,
        s.destino, s.puerto, s.fechaHora, s.duracionHoras, s.precio,
        s.capacidad, s.cupos
      FROM salidas s
      JOIN empresas e ON e.id = s.empresaId
      WHERE s.id = ?
    `).get(id);

    if (!salida) {
      return res.status(404).json({ error: true, mensaje: 'Salida no encontrada' });
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
      return res.status(400).json({ error: true, mensaje: errorValidacion });
    }

    const datos = datosSalida(req.body);
    const empresa = db.prepare('SELECT id FROM empresas WHERE id = ? AND activa = 1')
      .get(datos.empresaId);
    if (!empresa) {
      return res.status(400).json({ error: true, mensaje: 'La empresa no existe o está inactiva' });
    }

    const resultado = db.prepare(`
      INSERT INTO salidas (
        empresaId, embarcacion, tipo, destino, puerto, fechaHora, duracionHoras,
        precio, capacidad, cupos
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      datos.empresaId,
      datos.embarcacion,
      datos.tipo,
      datos.destino,
      datos.puerto,
      datos.fechaHora,
      datos.duracionHoras,
      datos.precio,
      datos.capacidad,
      datos.cupos,
    );

    const salida = db.prepare(`
      SELECT
        s.id, s.empresaId, e.razonSocial AS empresa, s.embarcacion, s.tipo,
        s.destino, s.puerto, s.fechaHora, s.duracionHoras, s.precio,
        s.capacidad, s.cupos
      FROM salidas s
      JOIN empresas e ON e.id = s.empresaId
      WHERE s.id = ?
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
      return res.status(400).json({ error: true, mensaje: errorValidacion });
    }

    const existente = db.prepare('SELECT id, capacidad, cupos FROM salidas WHERE id = ?').get(id);
    if (!existente) {
      return res.status(404).json({ error: true, mensaje: 'Salida no encontrada' });
    }

    const datos = datosSalida(req.body);
    const empresa = db.prepare('SELECT id FROM empresas WHERE id = ? AND activa = 1')
      .get(datos.empresaId);
    if (!empresa) {
      return res.status(400).json({ error: true, mensaje: 'La empresa no existe o está inactiva' });
    }

    const reservados = existente.capacidad - existente.cupos;
    if (datos.capacidad < reservados) {
      return res.status(400).json({
        error: true,
        mensaje: `La capacidad no puede ser menor que los ${reservados} cupos reservados`,
      });
    }

    db.prepare(`
      UPDATE salidas SET
        empresaId = ?,
        embarcacion = ?,
        tipo = ?,
        destino = ?,
        puerto = ?,
        fechaHora = ?,
        duracionHoras = ?,
        precio = ?,
        capacidad = ?,
        cupos = ?
      WHERE id = ?
    `).run(
      datos.empresaId,
      datos.embarcacion,
      datos.tipo,
      datos.destino,
      datos.puerto,
      datos.fechaHora,
      datos.duracionHoras,
      datos.precio,
      datos.capacidad,
      datos.cupos,
      id,
    );

    const salida = db.prepare(`
      SELECT
        s.id, s.empresaId, e.razonSocial AS empresa, s.embarcacion, s.tipo,
        s.destino, s.puerto, s.fechaHora, s.duracionHoras, s.precio,
        s.capacidad, s.cupos
      FROM salidas s
      JOIN empresas e ON e.id = s.empresaId
      WHERE s.id = ?
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
      return res.status(404).json({ error: true, mensaje: 'Salida no encontrada' });
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
}