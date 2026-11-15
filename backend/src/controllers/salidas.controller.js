const db = require('../db');
const {
  datosSalida, normalizarEstado, obtenerId, validarSalida,
} = require('../validators');

function listarSalidas(req, res, next) {
  try {
    const {
      destino, fecha, tipo, q, precioMin, precioMax, orden, dir, rango,
    } = req.query;
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
    if (precioMin !== undefined && precioMin !== '') {
      const minimo = Number(precioMin);
      if (!Number.isFinite(minimo) || minimo < 0) {
        return res.status(400).json({ error: true, mensaje: 'precioMin debe ser un número mayor o igual que 0' });
      }
      condiciones.push('s.precio >= ?');
      valores.push(minimo);
    }
    if (precioMax !== undefined && precioMax !== '') {
      const maximo = Number(precioMax);
      if (!Number.isFinite(maximo) || maximo < 0) {
        return res.status(400).json({ error: true, mensaje: 'precioMax debe ser un número mayor o igual que 0' });
      }
      condiciones.push('s.precio <= ?');
      valores.push(maximo);
    }
    if (precioMin !== undefined && precioMax !== undefined
      && precioMin !== '' && precioMax !== '' && Number(precioMin) > Number(precioMax)) {
      return res.status(400).json({ error: true, mensaje: 'precioMin no puede ser mayor que precioMax' });
    }
    if (rango === 'hoy') {
      const inicio = new Date();
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 1);
      condiciones.push('s.fechaHora >= ? AND s.fechaHora < ?');
      valores.push(aIsoLocal(inicio), aIsoLocal(fin));
    } else if (rango === '48h') {
      const inicio = new Date();
      const fin = new Date(inicio.getTime() + (48 * 60 * 60 * 1000));
      condiciones.push('s.fechaHora >= ? AND s.fechaHora <= ?');
      valores.push(aIsoLocal(inicio), aIsoLocal(fin));
    } else if (rango) {
      return res.status(400).json({ error: true, mensaje: 'rango debe ser hoy o 48h' });
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const ordenes = {
      fecha: 's.fechaHora',
      precio: 's.precio',
      duracion: 's.duracionHoras',
    };
    if (orden && !ordenes[orden]) {
      return res.status(400).json({ error: true, mensaje: 'orden debe ser fecha, precio o duracion' });
    }
    if (dir && !['asc', 'desc'].includes(String(dir).toLowerCase())) {
      return res.status(400).json({ error: true, mensaje: 'dir debe ser asc o desc' });
    }
    const columnaOrden = ordenes[orden] || ordenes.fecha;
    const direccion = String(dir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const tienePaginacion = req.query.page !== undefined || req.query.limit !== undefined;
    const pagina = req.query.page === undefined ? 1 : Number(req.query.page);
    const limite = req.query.limit === undefined ? 10 : Number(req.query.limit);
    if (tienePaginacion && (!Number.isInteger(pagina) || pagina < 1
      || !Number.isInteger(limite) || limite < 1 || limite > 100)) {
      return res.status(400).json({ error: true, mensaje: 'page debe ser entero mayor que 0 y limit un entero entre 1 y 100' });
    }
    const total = db.prepare(`
      SELECT COUNT(*) AS total
      FROM salidas s
      JOIN empresas e ON e.id = s.empresaId
      ${where}
    `).get(...valores).total;
    const paginacion = tienePaginacion ? ' LIMIT ? OFFSET ?' : '';
    const parametros = tienePaginacion
      ? [...valores, limite, (pagina - 1) * limite]
      : valores;
    const salidas = db.prepare(`
      SELECT
        s.id, s.empresaId, e.razonSocial AS empresa, s.embarcacion, s.tipo,
        s.destino, s.puerto, s.fechaHora, s.duracionHoras, s.precio,
        s.capacidad, s.cupos, s.estado
      FROM salidas s
      JOIN empresas e ON e.id = s.empresaId
      ${where}
      ORDER BY ${columnaOrden} ${direccion}, s.id ASC
      ${paginacion}
    `).all(...parametros);

    if (!tienePaginacion) return res.json(salidas);
    return res.json({
      salidas,
      paginacion: {
        pagina,
        limit: limite,
        total,
        totalPaginas: Math.max(1, Math.ceil(total / limite)),
      },
    });
  } catch (error) {
    return next(error);
  }
}

function aIsoLocal(fecha) {
  const partes = [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
    String(fecha.getHours()).padStart(2, '0'),
    String(fecha.getMinutes()).padStart(2, '0'),
  ];
  return `${partes[0]}-${partes[1]}-${partes[2]}T${partes[3]}:${partes[4]}`;
}

function obtenerSalida(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const salida = db.prepare(`
      SELECT
        s.id, s.empresaId, e.razonSocial AS empresa, s.embarcacion, s.tipo,
        s.destino, s.puerto, s.fechaHora, s.duracionHoras, s.precio,
        s.capacidad, s.cupos, s.estado
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
        s.capacidad, s.cupos, s.estado
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
        s.capacidad, s.cupos, s.estado
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
    const reservas = db.prepare('SELECT COUNT(*) AS total FROM reservas WHERE salidaId = ?').get(id);
    if (reservas.total > 0) {
      return res.status(409).json({
        error: true,
        mensaje: 'No se puede eliminar una salida con reservas',
      });
    }

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

function actualizarEstado(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const estado = normalizarEstado(req.body?.estado);
    if (!estado) {
      return res.status(400).json({
        error: true,
        mensaje: 'El estado debe ser programada, abordando, zarpó, zarpo o cancelada',
      });
    }

    const existente = db.prepare('SELECT id FROM salidas WHERE id = ?').get(id);
    if (!existente) {
      return res.status(404).json({ error: true, mensaje: 'Salida no encontrada' });
    }

    db.prepare('UPDATE salidas SET estado = ? WHERE id = ?').run(estado, id);
    const salida = db.prepare(`
      SELECT
        s.id, s.empresaId, e.razonSocial AS empresa, s.embarcacion, s.tipo,
        s.destino, s.puerto, s.fechaHora, s.duracionHoras, s.precio,
        s.capacidad, s.cupos, s.estado
      FROM salidas s
      JOIN empresas e ON e.id = s.empresaId
      WHERE s.id = ?
    `).get(id);
    return res.json(salida);
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
  actualizarEstado,
}