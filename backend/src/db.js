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

function crearTablaEmpresas() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      razonSocial TEXT NOT NULL,
      ruc TEXT NOT NULL UNIQUE,
      telefono TEXT NOT NULL,
      puertoBase TEXT NOT NULL,
      activa INTEGER NOT NULL DEFAULT 1
    )
  `);
}

function columnasDe(tabla) {
  return db.prepare(`PRAGMA table_info(${tabla})`).all().map((columna) => columna.name);
}

function siguienteRucTemporal() {
  const fila = db.prepare(`
    SELECT COALESCE(MAX(CAST(ruc AS INTEGER)), 20000000000) + 1 AS siguiente
    FROM empresas
    WHERE ruc GLOB '[0-9]*' AND length(ruc) = 11
  `).get();
  return String(fila.siguiente).padStart(11, '0');
}

function migrarSalidasExistentes() {
  const columnas = columnasDe('salidas');
  if (columnas.includes('empresaId')) return;

  db.exec('PRAGMA foreign_keys = OFF');
  db.exec('BEGIN');
  try {
    const empresasActuales = db.prepare(`
      SELECT DISTINCT empresa
      FROM salidas
      ORDER BY empresa
    `).all();
    const insertarEmpresa = db.prepare(`
      INSERT INTO empresas (razonSocial, ruc, telefono, puertoBase)
      VALUES (?, ?, ?, ?)
    `);
    const empresasPorNombre = new Map();

    for (const fila of empresasActuales) {
      const ruc = siguienteRucTemporal();
      const resultado = insertarEmpresa.run(
        fila.empresa,
        ruc,
        '000000000',
        'Por definir',
      );
      empresasPorNombre.set(fila.empresa, Number(resultado.lastInsertRowid));
    }

    db.exec(`
      CREATE TABLE salidas_nueva (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        empresaId INTEGER NOT NULL,
        embarcacion TEXT NOT NULL,
        tipo TEXT NOT NULL,
        destino TEXT NOT NULL,
        puerto TEXT NOT NULL,
        fechaHora TEXT NOT NULL,
        duracionHoras REAL NOT NULL,
        precio REAL NOT NULL,
        capacidad INTEGER NOT NULL,
        cupos INTEGER NOT NULL,
        estado TEXT NOT NULL DEFAULT 'programada'
          CHECK (estado IN ('programada', 'abordando', 'zarpó', 'zarpo', 'cancelada')),
        FOREIGN KEY (empresaId) REFERENCES empresas(id)
      )
    `);

    const filas = db.prepare('SELECT * FROM salidas ORDER BY id').all();
    const insertarSalida = db.prepare(`
      INSERT INTO salidas_nueva (
        id, empresaId, embarcacion, tipo, destino, puerto, fechaHora,
        duracionHoras, precio, capacidad, cupos, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const fila of filas) {
      insertarSalida.run(
        fila.id,
        empresasPorNombre.get(fila.empresa),
        fila.embarcacion,
        fila.tipo,
        fila.destino,
        fila.puerto,
        normalizarFechaHora(fila.fechaHora),
        fila.duracionHoras,
        fila.precio,
        fila.cupos,
        fila.cupos,
        'programada',
      );
    }

    db.exec('DROP TABLE salidas');
    db.exec('ALTER TABLE salidas_nueva RENAME TO salidas');
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  } finally {
    db.exec('PRAGMA foreign_keys = ON');
  }

  const errores = db.prepare('PRAGMA foreign_key_check').all();
  if (errores.length > 0) {
    throw new Error(`foreign_key_check encontró ${errores.length} errores`);
  }
}

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

function crearTablaSalidas() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS salidas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresaId INTEGER NOT NULL,
      embarcacion TEXT NOT NULL,
      tipo TEXT NOT NULL,
      destino TEXT NOT NULL,
      puerto TEXT NOT NULL,
      fechaHora TEXT NOT NULL,
      duracionHoras REAL NOT NULL,
      precio REAL NOT NULL,
      capacidad INTEGER NOT NULL,
      cupos INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'programada'
        CHECK (estado IN ('programada', 'abordando', 'zarpó', 'zarpo', 'cancelada')),
      FOREIGN KEY (empresaId) REFERENCES empresas(id)
    )
  `);
}

function seedSiVacio() {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM salidas').get();
  if (total > 0 || !fs.existsSync(seedPath)) return;

  const semillas = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  const insertarEmpresa = db.prepare(`
    INSERT INTO empresas (razonSocial, ruc, telefono, puertoBase)
    VALUES (?, ?, ?, ?)
  `);
  const insertarSalida = db.prepare(`
    INSERT INTO salidas (
      id, empresaId, embarcacion, tipo, destino, puerto, fechaHora,
      duracionHoras, precio, capacidad, cupos, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const empresasPorNombre = new Map();

  db.exec('BEGIN');
  try {
    for (const fila of semillas) {
      if (!empresasPorNombre.has(fila.empresa)) {
        const resultado = insertarEmpresa.run(
          fila.empresa,
          siguienteRucTemporal(),
          '000000000',
          fila.puerto,
        );
        empresasPorNombre.set(fila.empresa, Number(resultado.lastInsertRowid));
      }

      insertarSalida.run(
        fila.id,
        empresasPorNombre.get(fila.empresa),
        fila.embarcacion,
        fila.tipo,
        fila.destino,
        fila.puerto,
        normalizarFechaHora(fila.fechaHora),
        fila.duracionHoras,
        fila.precio,
        fila.cupos,
        fila.cupos,
        'programada',
      );
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function crearTablaReservas() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      salidaId INTEGER NOT NULL,
      nombre TEXT NOT NULL,
      dni TEXT NOT NULL,
      telefono TEXT NOT NULL,
      cantidad INTEGER NOT NULL CHECK (cantidad > 0),
      codigo TEXT NOT NULL UNIQUE,
      creadoEn TEXT NOT NULL,
      FOREIGN KEY (salidaId) REFERENCES salidas(id)
    )
  `);
}

crearTablaEmpresas();
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
migrarSalidasExistentes();
crearTablaSalidas();
if (!columnasDe('salidas').includes('estado')) {
  db.exec(`
    ALTER TABLE salidas
    ADD COLUMN estado TEXT NOT NULL DEFAULT 'programada'
      CHECK (estado IN ('programada', 'abordando', 'zarpó', 'zarpo', 'cancelada'))
  `);
}
normalizarFechasExistentes();
seedSiVacio();
crearTablaReservas();

module.exports = db;
