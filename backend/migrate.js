const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config();

// Jalankan semua berkas .sql di folder migrations menggunakan mysql2.
// Variabel environment yang dipakai:
// - DB_HOST (default: localhost)
// - DB_PORT (default: 3306)
// - DB_USER (default: root)
// - DB_PASSWORD (default: kosong)
// - DB_NAME (WAJIB, mis. byd_db)

const migrationsDir = path.resolve("migrations");

function listMigrations() {
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
  files.sort();
  return files;
}

async function runMigrations() {
  const {
    DB_HOST = "localhost",
    DB_PORT = "3306",
    DB_USER = "root",
    DB_PASSWORD = "",
    DB_NAME
  } = process.env;

  if (!DB_NAME) {
    // eslint-disable-next-line no-console
    console.error("DB_NAME belum diset di .env. Contoh: DB_NAME=byd_db");
    process.exit(1);
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true
  });

  try {
    const migrations = listMigrations();
    // eslint-disable-next-line no-console
    console.log("Menjalankan migrations pada database MySQL:", DB_NAME);

    for (const file of migrations) {
      const fullPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(fullPath, "utf8");
      // eslint-disable-next-line no-console
      console.log(`\n=== Menjalankan ${file} ===`);
      await connection.query(sql);
      // eslint-disable-next-line no-console
      console.log(`Selesai: ${file}`);
    }

    // eslint-disable-next-line no-console
    console.log("\nSemua migrations selesai.");
  } finally {
    await connection.end();
  }
}

runMigrations().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Gagal menjalankan migrations:", err.message);
  process.exit(1);
});

