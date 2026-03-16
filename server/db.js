const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'rufit.db');
let sqlDb = null;

function save() {
  if (!sqlDb) return;
  const data = sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function normalizeParams(params) {
  if (params.length === 0) return [];
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  return params;
}

function makeStatement(sql) {
  return {
    get(...params) {
      const stmt = sqlDb.prepare(sql);
      const p = normalizeParams(params);
      if (p.length > 0) stmt.bind(p);
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    all(...params) {
      const stmt = sqlDb.prepare(sql);
      const p = normalizeParams(params);
      if (p.length > 0) stmt.bind(p);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    run(...params) {
      const p = normalizeParams(params);
      sqlDb.run(sql, p.length > 0 ? p : []);
      const res = sqlDb.exec('SELECT last_insert_rowid()');
      const lastInsertRowid = res[0]?.values[0]?.[0] ?? 0;
      save();
      return { lastInsertRowid };
    },
  };
}

const db = {
  prepare(sql) { return makeStatement(sql); },
  exec(sql) { sqlDb.exec(sql); save(); },
};

async function initDb() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    sqlDb = new SQL.Database(new Uint8Array(fs.readFileSync(DB_PATH)));
  } else {
    sqlDb = new SQL.Database();
  }

  sqlDb.run('PRAGMA foreign_keys = ON');
  sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS food_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      day TEXT NOT NULL DEFAULT 'День 1'
    );
    CREATE TABLE IF NOT EXISTS exercise_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sets TEXT NOT NULL DEFAULT '',
      reps TEXT NOT NULL DEFAULT '',
      day TEXT NOT NULL DEFAULT 'День 1'
    );
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      age INTEGER,
      height INTEGER,
      weight REAL,
      waist INTEGER
    );
  `);
  save();
}

db.initDb = initDb;
module.exports = db;
