import { Pool } from 'pg';

// --- PENTING ---
// Skrip ini mengasumsikan Anda menjalankan aplikasi di lingkungan Netlify
// di mana variabel lingkungan DATABASE_URL secara otomatis disediakan oleh
// addon Neon Database.

// Untuk pengembangan lokal, Anda harus membuat file .env dan menambahkan
// string koneksi Neon Anda sendiri, seperti ini:
// DATABASE_URL="postgresql://user:password@host:port/dbname?sslmode=require"

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Penting: Variabel lingkungan DATABASE_URL tidak ditemukan. Pastikan variabel tersebut diatur di lingkungan Anda.");
}

const pool = new Pool({
  connectionString,
});

export async function query(text: string, params: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}
