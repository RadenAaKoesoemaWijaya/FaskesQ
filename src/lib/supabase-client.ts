
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types-supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
    throw new Error("Penting: Variabel lingkungan NEXT_PUBLIC_SUPABASE_URL tidak ditemukan. Pastikan Anda membuat file .env dan menambahkannya.");
}
if (!supabaseAnonKey) {
    throw new Error("Penting: Variabel lingkungan NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan. Pastikan Anda membuat file .env dan menambahkannya.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
