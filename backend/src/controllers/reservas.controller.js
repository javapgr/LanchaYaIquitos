const db = require('../db');
const {
  datosReserva,
  obtenerId,
  validarReserva,
} = require('../validators');
const { generarCodigoReserva } = require('../utils/reservas');

function reservaConSalida(id) {
  return db.prepare(`
    SELECT
      r.id, r.salidaId, r.nombre, r.dni, r.telefono, r.cantidad,
      r.codigo, r.creadoEn,
      s.destino, s.fechaHora, e.razonSocial AS empresa
    FROM reservas r
    JOIN salidas s ON s.id = r.salidaId
    JOIN empresas e ON e.id = s.empresaId
    WHERE r.id = ?
  `).get(id);
}

function crearReserva(req, res, next) {
  try {
    const errorValidacion = validarReserva(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: true, mensaje: errorValidacion });
    }

    const salidaId = obtenerId(req.params.id);
    const datos = datosReserva(req.body);
    db.exec('BEGIN IMMEDIATE');
    try {
      const salida = db.prepare(`
        SELECT id, cupos, estado
        FROM salidas
        WHERE id = ?
      `).get(salidaId);

      if (!salida) {
        db.exec('ROLLBACK');
        return res.status(404).json({ error: true, mensaje: 'Salida no encontrada' });
      }

      if (['zarpó', 'zarpo', 'cancelada'].includes(salida.estado)) {
        db.exec('ROLLBACK');
        return res.status(409).json({
          error: true,
          mensaje: 'La salida ya no acepta reservas por su estado actual',
        });
      }

      if (datos.cantidad > salida.cupos) {
        db.exec('ROLLBACK');
        return res.status(409).json({ error: true, mensaje: 'No hay cupos suficientes' });
      }

      const codigo = generarCodigoReserva(db);
      const creadoEn = new Date().toISOString();
      const resultado = db.prepare(`
        INSERT INTO reservas (salidaId, nombre, dni, telefono, cantidad, codigo, creadoEn)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        salidaId,
        datos.nombre,
        datos.dni,
        datos.telefono,
        datos.cantidad,
        codigo,
        creadoEn,
      );
      db.prepare('UPDATE salidas SET cupos = cupos - ? WHERE id = ?')
        .run(datos.cantidad, salidaId);
      db.exec('COMMIT');

      return res.status(201).json(reservaConSalida(resultado.lastInsertRowid));
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    return next(error);
  }
}

function listarReservas(req, res, next) {
  try {
    const salidaId = obtenerId(req.params.id);
    const salida = db.prepare('SELECT id FROM salidas WHERE id = ?').get(salidaId);
    if (!salida) {
      return res.status(404).json({ error: true, mensaje: 'Salida no encontrada' });
    }

    const reservas = db.prepare(`
      SELECT id, salidaId, nombre, dni, telefono, cantidad, codigo, creadoEn
      FROM reservas
      WHERE salidaId = ?
      ORDER BY creadoEn ASC
    `).all(salidaId);
    return res.json(reservas);
  } catch (error) {
    return next(error);
  }
}

function eliminarReserva(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    db.exec('BEGIN IMMEDIATE');
    try {
      const reserva = db.prepare('SELECT id, salidaId, cantidad FROM reservas WHERE id = ?').get(id);
      if (!reserva) {
        db.exec('ROLLBACK');
        return res.status(404).json({ error: true, mensaje: 'Reserva no encontrada' });
      }

      db.prepare('DELETE FROM reservas WHERE id = ?').run(id);
      db.prepare('UPDATE salidas SET cupos = cupos + ? WHERE id = ?')
        .run(reserva.cantidad, reserva.salidaId);
      db.exec('COMMIT');
      return res.status(204).send();
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    return next(error);
  }
}

function obtenerReservaPorCodigo(req, res, next) {
  try {
    const codigo = String(req.params.codigo || '').trim().toUpperCase();
    if (!/^LY-[A-Z0-9]{5}$/.test(codigo)) {
      return res.status(400).json({ error: true, mensaje: 'El código de reserva no es válido' });
    }

    const reserva = db.prepare(`
      SELECT
        r.id, r.salidaId, r.nombre, r.dni, r.telefono, r.cantidad,
        r.codigo, r.creadoEn,
        s.destino, s.fechaHora, s.puerto, e.razonSocial AS empresa
      FROM reservas r
      JOIN salidas s ON s.id = r.salidaId
      JOIN empresas e ON e.id = s.empresaId
      WHERE r.codigo = ?
    `).get(codigo);
    if (!reserva) {
      return res.status(404).json({ error: true, mensaje: 'Reserva no encontrada' });
    }

    return res.json(reserva);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  crearReserva,
  listarReservas,
  eliminarReserva,
  obtenerReservaPorCodigo,
};
