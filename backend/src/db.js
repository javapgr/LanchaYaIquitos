const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, 'data');
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'salidas.db');
const seedPath = path.join(dataDir, 'salidas.json');

const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');

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
        fila.fechaHora,
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

seedSiVacio();

module.exports = db;
