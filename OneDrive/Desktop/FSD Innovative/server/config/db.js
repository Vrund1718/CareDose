const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

let dbMode = 'mysql';
let mysqlPool = null;
let sqliteDb = null;

// Initialize Database connection
async function initDb() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'caredose_db';
  const port = process.env.DB_PORT || 3306;

  try {
    // Attempt MySQL connection
    const tempConn = await mysql.createConnection({
      host,
      user,
      password,
      port,
      connectTimeout: 2000
    });
    
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await tempConn.end();

    mysqlPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    const connection = await mysqlPool.getConnection();
    connection.release();
    dbMode = 'mysql';
    console.log(`[DB] Connected successfully to MySQL database "${database}" on ${host}:${port}`);
    
    await setupTablesMySQL();
    return;
  } catch (err) {
    console.warn(`[DB Warning] MySQL server on ${host}:${port} not active. Falling back to embedded relational storage.`);
    dbMode = 'sqlite';
    await initSQLite();
  }
}

// Helper to execute SQL queries across MySQL or SQLite with parameterized inputs
async function query(sql, params = []) {
  if (dbMode === 'mysql') {
    const [rows, fields] = await mysqlPool.execute(sql, params);
    return rows;
  } else {
    return new Promise((resolve, reject) => {
      const trimmed = sql.trim();
      const isSelect = trimmed.toUpperCase().startsWith('SELECT') || trimmed.toUpperCase().startsWith('PRAGMA');
      
      if (isSelect) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({
            insertId: this.lastID,
            affectedRows: this.changes
          });
        });
      }
    });
  }
}

// Setup MySQL Tables
async function setupTablesMySQL() {
  const tableQueries = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('patient', 'caregiver') NOT NULL,
      invite_code VARCHAR(20) UNIQUE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS caregiver_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      caregiver_id INT NOT NULL,
      status ENUM('pending', 'active') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (caregiver_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT unique_patient_caregiver UNIQUE (patient_id, caregiver_id)
    )`,
    `CREATE TABLE IF NOT EXISTS medicines (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      dosage VARCHAR(50) NOT NULL,
      frequency VARCHAR(50) NOT NULL,
      stock_qty INT NOT NULL DEFAULT 0,
      refill_threshold INT NOT NULL DEFAULT 5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      medicine_id INT NOT NULL,
      time_slot VARCHAR(10) NOT NULL,
      FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS dose_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      schedule_id INT NOT NULL,
      date DATE NOT NULL,
      status ENUM('taken', 'missed', 'pending') DEFAULT 'pending',
      logged_at DATETIME NULL,
      FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
      CONSTRAINT unique_schedule_date UNIQUE (schedule_id, date)
    )`,
    `CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id INT NOT NULL,
      doctor_name VARCHAR(100) NOT NULL,
      date_time DATETIME NOT NULL,
      notes TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const q of tableQueries) {
    await mysqlPool.execute(q);
  }

  await seedInitialData();
}

// Setup SQLite Tables (Fallback)
function initSQLite() {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(__dirname, '..', 'caredose_local.db');
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('[DB Error] Failed to open SQLite database', err);
        return reject(err);
      }
      console.log(`[DB] Embedded SQLite database initialized at ${dbPath}`);
      
      sqliteDb.serialize(() => {
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT CHECK(role IN ('patient', 'caregiver')) NOT NULL,
          invite_code TEXT UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS caregiver_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          caregiver_id INTEGER NOT NULL,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(patient_id, caregiver_id)
        )`);

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS medicines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          dosage TEXT NOT NULL,
          frequency TEXT NOT NULL,
          stock_qty INTEGER NOT NULL DEFAULT 0,
          refill_threshold INTEGER NOT NULL DEFAULT 5,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS schedules (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          medicine_id INTEGER NOT NULL,
          time_slot TEXT NOT NULL
        )`);

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS dose_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          schedule_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          status TEXT CHECK(status IN ('taken', 'missed', 'pending')) DEFAULT 'pending',
          logged_at DATETIME,
          UNIQUE(schedule_id, date)
        )`);

        sqliteDb.run(`CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          doctor_name TEXT NOT NULL,
          date_time DATETIME NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, async (err) => {
          if (err) return reject(err);
          try {
            await seedInitialData();
            resolve();
          } catch (e) {
            reject(e);
          }
        });
      });
    });
  });
}

// Seed initial default demo data if users table is empty
async function seedInitialData() {
  try {
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    const count = existingUsers[0].count !== undefined ? existingUsers[0].count : existingUsers[0]['COUNT(*)'];
    if (count === 0) {
      console.log('[DB] Seeding default demo accounts and medications...');
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash('Password123!', salt);

      // Seed Patient: Eleanor Vance
      await query(
        'INSERT INTO users (name, email, password_hash, role, invite_code) VALUES (?, ?, ?, ?, ?)',
        ['Eleanor Vance', 'patient@caredose.com', hashedPass, 'patient', 'PAT-8842-CD']
      );

      // Seed Caregiver: Dr. Marcus Vance
      await query(
        'INSERT INTO users (name, email, password_hash, role, invite_code) VALUES (?, ?, ?, ?, ?)',
        ['Dr. Marcus Vance', 'caregiver@caredose.com', hashedPass, 'caregiver', null]
      );

      // Link Caregiver (id: 2) to Patient (id: 1)
      await query(
        'INSERT INTO caregiver_links (patient_id, caregiver_id, status) VALUES (?, ?, ?)',
        [1, 2, 'active']
      );

      // Seed Medicines for Eleanor Vance
      const res1 = await query(
        'INSERT INTO medicines (patient_id, name, dosage, frequency, stock_qty, refill_threshold) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'Lisinopril', '10 mg', 'Twice Daily', 14, 10]
      );
      const m1Id = res1.insertId || 1;

      const res2 = await query(
        'INSERT INTO medicines (patient_id, name, dosage, frequency, stock_qty, refill_threshold) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'Metformin', '500 mg', 'Once Daily (Morning)', 3, 5]
      );
      const m2Id = res2.insertId || 2;

      const res3 = await query(
        'INSERT INTO medicines (patient_id, name, dosage, frequency, stock_qty, refill_threshold) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'Atorvastatin', '20 mg', 'Once Daily (Night)', 28, 7]
      );
      const m3Id = res3.insertId || 3;

      // Seed Schedules
      await query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [m1Id, '08:00']);
      await query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [m1Id, '20:00']);
      await query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [m2Id, '09:00']);
      await query('INSERT INTO schedules (medicine_id, time_slot) VALUES (?, ?)', [m3Id, '21:00']);

      // Seed Appointments
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 10);

      await query(
        'INSERT INTO appointments (patient_id, doctor_name, date_time, notes) VALUES (?, ?, ?, ?)',
        [1, 'Dr. Sarah Jenkins (Cardiologist)', tomorrow.toISOString().replace('T', ' ').substring(0, 19), 'Routine blood pressure review and lab report check']
      );

      await query(
        'INSERT INTO appointments (patient_id, doctor_name, date_time, notes) VALUES (?, ?, ?, ?)',
        [1, 'Dr. Robert Chen (Endocrinologist)', nextWeek.toISOString().replace('T', ' ').substring(0, 19), 'Quarterly HbA1c screening consultation']
      );

      console.log('[DB] Demo data seeded successfully!');
      console.log(' - Patient: patient@caredose.com / Password123! (Invite Code: PAT-8842-CD)');
      console.log(' - Caregiver: caregiver@caredose.com / Password123!');
    }
  } catch (err) {
    console.error('[DB Error] Failed to seed initial data:', err);
  }
}

module.exports = {
  initDb,
  query,
  getMode: () => dbMode
};
