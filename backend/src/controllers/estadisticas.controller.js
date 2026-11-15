const db = require('../db');

function redondearPrecio(valor) {
  return Math.round(Number(valor) * 100) / 100;
}

function obtenerEstadisticas(req, res, next) {
  try {
    const { totalSalidas } = db.prepare(`
      SELECT COUNT(*) AS totalSalidas
      FROM salidas
    `).get();

    const porDestino = db.prepare(`
      SELECT
        destino,
        COUNT(*) AS total,
        AVG(precio) AS precioPromedio
      FROM salidas
      GROUP BY destino
      ORDER BY destino ASC
    `).all().map((fila) => ({
      destino: fila.destino,
      total: Number(fila.total),
      precioPromedio: redondearPrecio(fila.precioPromedio),
    }));

    const porTipo = db.prepare(`
      SELECT
        tipo,
        COUNT(*) AS total
      FROM salidas
      GROUP BY tipo
      ORDER BY tipo ASC
    `).all().map((fila) => ({
      tipo: fila.tipo,
      total: Number(fila.total),
    }));

    const { cuposReservados } = db.prepare(`
      SELECT COALESCE(SUM(cantidad), 0) AS cuposReservados
      FROM reservas
    `).get();

    const { cuposDisponibles } = db.prepare(`
      SELECT COALESCE(SUM(cupos), 0) AS cuposDisponibles
      FROM salidas
    `).get();

    return res.json({
      totalSalidas: Number(totalSalidas) || 0,
      porDestino,
      porTipo,
      cuposReservados: Number(cuposReservados) || 0,
      cuposDisponibles: Number(cuposDisponibles) || 0,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { obtenerEstadisticas };
