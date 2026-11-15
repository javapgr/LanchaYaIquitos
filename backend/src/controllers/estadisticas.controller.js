const db = require('../db');

function listarEstadisticas(req, res, next) {
  try {
    const totalSalidas = db.prepare('SELECT COUNT(*) AS total FROM salidas').get().total;
    const porDestino = db.prepare(`
      SELECT destino, COUNT(*) AS total, ROUND(AVG(precio), 2) AS precioPromedio
      FROM salidas
      GROUP BY destino
      ORDER BY destino ASC
    `).all();
    const porTipo = db.prepare(`
      SELECT tipo, COUNT(*) AS total
      FROM salidas
      GROUP BY tipo
      ORDER BY tipo ASC
    `).all();
    const totales = db.prepare(`
      SELECT
        (SELECT COALESCE(SUM(cantidad), 0) FROM reservas) AS cuposReservados,
        (SELECT COALESCE(SUM(cupos), 0) FROM salidas) AS cuposDisponibles,
        (SELECT COALESCE(ROUND(AVG(precio), 2), 0) FROM salidas) AS precioPromedioGeneral
    `).get();

    return res.json({
      totalSalidas: Number(totalSalidas),
      porDestino: porDestino.map((fila) => ({
        destino: fila.destino,
        total: Number(fila.total),
        precioPromedio: Number(fila.precioPromedio),
      })),
      porTipo: porTipo.map((fila) => ({ tipo: fila.tipo, total: Number(fila.total) })),
      cuposReservados: Number(totales.cuposReservados),
      cuposDisponibles: Number(totales.cuposDisponibles),
      precioPromedioGeneral: Number(totales.precioPromedioGeneral),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarEstadisticas };
