// ==========================
// database.js
// ==========================
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("iam.db");

// ==========================
// USERS TABLE
// ==========================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT,
      department TEXT,
      location TEXT,
      approved INTEGER,
      role TEXT,
      status TEXT,
      provisioningState TEXT,
      manager TEXT
    )
  `);
});

// ==========================
// ROLE CATALOG TABLE
// ==========================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS role_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department TEXT,
      role TEXT,
      entitlements TEXT
    )
  `);

  // Pre-fill role catalog if not exists
  db.run(`
    INSERT OR IGNORE INTO role_catalog (department, role, entitlements) VALUES
    ('IT','Admin','Server,DB,App'),
    ('HR','User','Payroll,Recruitment')
  `);
});

// ==========================
// AUDIT LOGS TABLE
// ==========================
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      action TEXT,
      performedBy TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// ==========================
// EXPORT DB
// ==========================
module.exports = db;
