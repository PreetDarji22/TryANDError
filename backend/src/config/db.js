const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbClient = null;
let dbType = 'sqlite'; // 'pg' or 'sqlite'

// Utility to convert PostgreSQL SQL parameterized queries ($1, $2) to SQLite (?)
function convertPgToSqliteQuery(text, params = []) {
  let sqliteText = text;
  // Replace $1, $2, etc with ?
  sqliteText = sqliteText.replace(/\$\d+/g, '?');

  // Replace Postgres-specific syntax if any
  sqliteText = sqliteText.replace(/TIMESTAMP WITH TIME ZONE/gi, 'DATETIME');
  sqliteText = sqliteText.replace(/CURRENT_TIMESTAMP/gi, "CURRENT_TIMESTAMP");
  sqliteText = sqliteText.replace(/vote_vote_type/gi, 'vote_type');
  sqliteText = sqliteText.replace(/\bILIKE\b/gi, 'LIKE');
  sqliteText = sqliteText.replace(/RETURNING\s+[\w\s,*\.]+/gi, '');
  return sqliteText;
}

// Initialize SQLite Schema
function initSqliteDatabase(sqliteDb) {
  return new Promise((resolve, reject) => {
    sqliteDb.serialize(() => {
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'USER',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS question_tags (
          question_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (question_id, tag_id),
          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS answers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          description TEXT NOT NULL,
          is_accepted INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS votes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          answer_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          vote_type TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (answer_id, user_id),
          FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          answer_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          actor_id INTEGER NOT NULL,
          type TEXT NOT NULL,
          reference_url TEXT,
          is_read INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

// Database Connection Setup
async function initDatabase() {
  const { Pool } = require('pg');
  const sqlite3 = require('sqlite3').verbose();

  // Try PostgreSQL if DATABASE_URL or DB_HOST is configured
  if (process.env.DATABASE_URL || process.env.DB_HOST) {
    try {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'stackit_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        connectionTimeoutMillis: 3000,
      });

      // Quick ping test
      const res = await pool.query('SELECT NOW()');
      console.log('Connected to PostgreSQL database at:', res.rows[0].now);
      dbClient = pool;
      dbType = 'pg';
      return;
    } catch (pgErr) {
      console.warn('PostgreSQL connection attempt failed. Falling back to SQLite database.', pgErr.message);
    }
  }

  // Fallback to SQLite
  const dbDir = path.join(__dirname, '../../database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'stackit.db');

  return new Promise((resolve, reject) => {
    const sqliteDb = new sqlite3.Database(dbPath, async (err) => {
      if (err) {
        console.error('Failed to connect to SQLite DB:', err);
        return reject(err);
      }
      console.log('Connected to SQLite database at:', dbPath);
      dbClient = sqliteDb;
      dbType = 'sqlite';
      try {
        await initSqliteDatabase(sqliteDb);
        console.log('SQLite database schema initialized successfully.');
        resolve();
      } catch (schemaErr) {
        reject(schemaErr);
      }
    });
  });
}

// Normalized query function
async function query(text, params = []) {
  if (!dbClient) {
    await initDatabase();
  }

  if (dbType === 'pg') {
    const res = await dbClient.query(text, params);
    return res;
  } else {
    // SQLite implementation
    return new Promise((resolve, reject) => {
      const sqliteText = convertPgToSqliteQuery(text, params);
      const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT') || 
                       sqliteText.trim().toUpperCase().startsWith('PRAGMA') ||
                       sqliteText.trim().toUpperCase().startsWith('WITH');

      if (isSelect) {
        dbClient.all(sqliteText, params, (err, rows) => {
          if (err) return reject(err);
          // Convert boolean integer fields in SQLite rows if present
          const formattedRows = rows.map(r => {
            const rowObj = { ...r };
            if ('is_accepted' in rowObj) rowObj.is_accepted = Boolean(rowObj.is_accepted);
            if ('is_read' in rowObj) rowObj.is_read = Boolean(rowObj.is_read);
            return rowObj;
          });
          resolve({ rows: formattedRows, rowCount: rows.length });
        });
      } else {
        dbClient.run(sqliteText, params, function (err) {
          if (err) return reject(err);
          // If query had RETURNING clause or was INSERT, let's fetch inserted row if requested
          if (text.toUpperCase().includes('INSERT') && (text.toUpperCase().includes('RETURNING') || this.lastID)) {
            // Determine table from INSERT INTO <table>
            const match = text.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
            const tableName = match ? match[1] : null;
            if (tableName && this.lastID) {
              dbClient.get(`SELECT * FROM ${tableName} WHERE id = ?`, [this.lastID], (getErr, row) => {
                if (getErr) return resolve({ rows: [{ id: this.lastID }], rowCount: 1 });
                if (row) {
                  if ('is_accepted' in row) row.is_accepted = Boolean(row.is_accepted);
                  if ('is_read' in row) row.is_read = Boolean(row.is_read);
                  return resolve({ rows: [row], rowCount: 1, insertId: this.lastID });
                }
                resolve({ rows: [{ id: this.lastID }], rowCount: 1, insertId: this.lastID });
              });
              return;
            }
          }

          if (text.toUpperCase().includes('UPDATE') && text.toUpperCase().includes('RETURNING')) {
            // For update with returning, return affected count
            return resolve({ rows: [], rowCount: this.changes });
          }

          resolve({ rows: [], rowCount: this.changes, insertId: this.lastID });
        });
      }
    });
  }
}

module.exports = {
  query,
  initDatabase,
  getDbType: () => dbType
};
