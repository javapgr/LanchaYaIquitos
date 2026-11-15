const { randomInt } = require('node:crypto');

const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generarCodigoReserva(db) {
  for (let intento = 0; intento < 10; intento += 1) {
    let sufijo = '';
    for (let indice = 0; indice < 5; indice += 1) {
      sufijo += caracteres[randomInt(caracteres.length)];
    }
    const codigo = `LY-${sufijo}`;
    const existente = db.prepare('SELECT id FROM reservas WHERE codigo = ?').get(codigo);
    if (!existente) return codigo;
  }

  throw new Error('No se pudo generar un código de reserva único');
}

module.exports = { generarCodigoReserva };
