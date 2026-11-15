const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { normalizarFechaHora } = require('./validators');

const dataDir = path.join(__dirname, 'data');
const dbPath = process.env.DATA_PATH || path.join(dataDir, 'salidas.db');
const seedPath = path.join(dataDir, 'salidas.json');

const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS salidas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa TEXT NOT NULL,
    embarcacion TEXT NOT NULL,
    tipo TEXT NOT NULL,
    destino TEXT NOT NULL,
    puerto TEXT NOT NULL,
    fechaHora TEXT NOT NULL,
    duracionHoras REAL NOT NULL,
    precio REAL NOT NULL,
    cupos INTEGER NOT NULL
  )
`);

function normalizarFechasExistentes() {
  const filas = db.prepare('SELECT id, fechaHora FROM salidas').all();
  const actualizar = db.prepare('UPDATE salidas SET fechaHora = ? WHERE id = ?');

  db.exec('BEGIN');
  try {
    for (const fila of filas) {
      const fechaHora = normalizarFechaHora(fila.fechaHora);
      if (!fechaHora) {
        throw new Error(`fechaHora inválida en salida ${fila.id}`);
      }
      if (fechaHora !== fila.fechaHora) {
        actualizar.run(fechaHora, fila.id);
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function seedSiVacio() {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM salidas').get();
  if (total > 0 || !fs.existsSync(seedPath)) return;

  const semillas = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const insertar = db.prepare(`
    INSERT INTO salidas (
      id, empresa, embarcacion, tipo, destino, puerto, fechaHora, duracionHoras, precio, cupos
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  db.exec('BEGIN');
  try {
    for (const fila of semillas) {
      insertar.run(
        fila.id,
        fila.empresa,
        fila.embarcacion,
        fila.tipo,
        fila.destino,
        fila.puerto,
        normalizarFechaHora(fila.fechaHora),
        fila.duracionHoras,
        fila.precio,
        fila.cupos,
      );
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

normalizarFechasExistentes();
seedSiVacio();

module.exports = db;
