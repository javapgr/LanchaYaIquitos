const db = require('../db');
const {
  datosEmpresa,
  obtenerId,
  validarEmpresa,
} = require('../validators');

function manejarErrorUnico(error, res, next) {
  if (
    String(error.code).includes('SQLITE_CONSTRAINT')
    || error.errcode === 2067
    || String(error.message).includes('UNIQUE constraint')
  ) {
    return res.status(409).json({
      error: true,
      mensaje: 'El RUC ya está registrado, incluso si la empresa está dada de baja',
    });
  }
  return next(error);
}

function listarEmpresas(req, res, next) {
  try {
    const empresas = db.prepare(`
      SELECT id, razonSocial, ruc, telefono, puertoBase, activa
      FROM empresas
      WHERE activa = 1
      ORDER BY razonSocial ASC
    `).all();
    return res.json(empresas);
  } catch (error) {
    return next(error);
  }
}

function obtenerEmpresa(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const empresa = db.prepare(`
      SELECT id, razonSocial, ruc, telefono, puertoBase, activa
      FROM empresas
      WHERE id = ? AND activa = 1
    `).get(id);

    if (!empresa) {
      return res.status(404).json({ error: true, mensaje: 'Empresa no encontrada' });
    }

    return res.json(empresa);
  } catch (error) {
    return next(error);
  }
}

function crearEmpresa(req, res, next) {
  try {
    const errorValidacion = validarEmpresa(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: true, mensaje: errorValidacion });
    }

    const datos = datosEmpresa(req.body);
    const resultado = db.prepare(`
      INSERT INTO empresas (razonSocial, ruc, telefono, puertoBase)
      VALUES (?, ?, ?, ?)
    `).run(datos.razonSocial, datos.ruc, datos.telefono, datos.puertoBase);

    return res.status(201).json(
      db.prepare(`
        SELECT id, razonSocial, ruc, telefono, puertoBase, activa
        FROM empresas
        WHERE id = ?
      `).get(resultado.lastInsertRowid),
    );
  } catch (error) {
    return manejarErrorUnico(error, res, next);
  }
}

function actualizarEmpresa(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const errorValidacion = validarEmpresa(req.body);
    if (errorValidacion) {
      return res.status(400).json({ error: true, mensaje: errorValidacion });
    }

    const existente = db.prepare('SELECT id FROM empresas WHERE id = ? AND activa = 1').get(id);
    if (!existente) {
      return res.status(404).json({ error: true, mensaje: 'Empresa no encontrada' });
    }

    const datos = datosEmpresa(req.body);
    db.prepare(`
      UPDATE empresas
      SET razonSocial = ?, ruc = ?, telefono = ?, puertoBase = ?
      WHERE id = ?
    `).run(datos.razonSocial, datos.ruc, datos.telefono, datos.puertoBase, id);

    return res.json(
      db.prepare(`
        SELECT id, razonSocial, ruc, telefono, puertoBase, activa
        FROM empresas
        WHERE id = ?
      `).get(id),
    );
  } catch (error) {
    return manejarErrorUnico(error, res, next);
  }
}

function eliminarEmpresa(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const existente = db.prepare('SELECT id FROM empresas WHERE id = ? AND activa = 1').get(id);
    if (!existente) {
      return res.status(404).json({ error: true, mensaje: 'Empresa no encontrada' });
    }

    const futuras = db.prepare(`
      SELECT COUNT(*) AS total
      FROM salidas
      WHERE empresaId = ?
        AND fechaHora >= strftime('%Y-%m-%dT%H:%M', 'now')
    `).get(id);
    if (futuras.total > 0) {
      return res.status(409).json({
        error: true,
        mensaje: 'No se puede dar de baja una empresa con salidas futuras',
      });
    }

    db.prepare('UPDATE empresas SET activa = 0 WHERE id = ?').run(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

function listarSalidasEmpresa(req, res, next) {
  try {
    const id = obtenerId(req.params.id);
    const empresa = db.prepare('SELECT id FROM empresas WHERE id = ?').get(id);
    if (!empresa) {
      return res.status(404).json({ error: true, mensaje: 'Empresa no encontrada' });
    }

    const salidas = db.prepare(`
      SELECT
        s.id, s.empresaId, e.razonSocial AS empresa, s.embarcacion, s.tipo,
        s.destino, s.puerto, s.fechaHora, s.duracionHoras, s.precio,
        s.capacidad, s.cupos
      FROM salidas s
      JOIN empresas e ON e.id = s.empresaId
      WHERE s.empresaId = ?
      ORDER BY s.fechaHora ASC
    `).all(id);
    return res.json(salidas);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listarEmpresas,
  obtenerEmpresa,
  crearEmpresa,
  actualizarEmpresa,
  eliminarEmpresa,
  listarSalidasEmpresa,
};
