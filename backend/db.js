const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config();

const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASSWORD = "",
  DB_NAME = "byd_db"
} = process.env;

if (!DB_NAME) {
  // eslint-disable-next-line no-console
  console.warn(
    "[DB] Environment variable DB_NAME belum diset. Koneksi MySQL akan gagal sampai DB_NAME diisi."
  );
}

const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: false
});

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    // eslint-disable-next-line no-console
    console.log("[DB] Koneksi MySQL OK");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[DB] Gagal konek ke MySQL:", err.message);
  }
}

module.exports = { pool, testConnection };

