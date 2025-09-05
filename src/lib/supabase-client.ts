
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types-supabase';

// --- PENTING ---
// Kredensial Supabase disematkan di sini untuk tujuan pengembangan agar aplikasi dapat berjalan.
// Untuk produksi, SANGAT DISARANKAN untuk memindahkan ini ke variabel lingkungan (misalnya, file .env.local)
// dan menggunakan process.env.NEXT_PUBLIC_SUPABASE_URL dan process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.

const supabaseUrl = 'https://example.supabase.co';
const supabaseAnonKey = 'example-anon-key';


if (!supabaseUrl) {
    throw new Error("Penting: Variabel lingkungan NEXT_PUBLIC_SUPABASE_URL tidak ditemukan. Pastikan Anda membuat file .env dan menambahkannya.");
}
if (!supabaseAnonKey) {
    throw new Error("Penting: Variabel lingkungan NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan. Pastikan Anda membuat file .env dan menambahkannya.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
