
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

function getDbClient() {
    if (!connectionString) {
        console.warn("Peringatan: Variabel lingkungan DATABASE_URL tidak ditemukan. Kueri database tidak akan berfungsi.");
        // Return a dummy client that will throw an error if used.
        // This allows the application to build and run without a database connection.
        return (query: any, params: any) => {
            throw new Error("Koneksi database tidak dikonfigurasi. Atur DATABASE_URL di file .env Anda.");
        }
    }
    return neon(connectionString);
}


export const sql = getDbClient();
