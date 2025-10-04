
import { neon, neonConfig } from '@neondatabase/serverless';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

// Configure connection pooling and timeouts
neonConfig.fetchConnectionCache = true;
neonConfig.fetchFunction = (url: string, options: any) => {
  return fetch(url, {
    ...options,
    cache: 'no-store',
    next: { revalidate: 0 }
  });
};

interface DbClient {
  (query: string, params?: any[]): Promise<any>;
  close?: () => Promise<void>;
}

function getDbClient(): DbClient {
    if (!connectionString) {
        console.error("ERROR: Variabel lingkungan DATABASE_URL tidak ditemukan.");
        console.error("Database operations will fail. Please set DATABASE_URL in your .env file.");
        
        return (query: string, params?: any[]) => {
            throw new Error("Database connection not configured. Please set DATABASE_URL in your .env file.");
        }
    }
    
    try {
        const client = neon(connectionString);
        
        // Return enhanced client with error handling
        return async (query: string, params?: any[]) => {
            try {
                const startTime = Date.now();
                const result = await client(query, params);
                const duration = Date.now() - startTime;
                
                if (duration > 5000) {
                    console.warn(`Slow query detected (${duration}ms):`, query.substring(0, 100));
                }
                
                return result;
            } catch (error) {
                console.error('Database query error:', error);
                console.error('Query:', query);
                console.error('Params:', params);
                
                // Re-throw with more context
                throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };
    } catch (error) {
        console.error('Failed to initialize database client:', error);
        throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
    try {
        const client = getDbClient();
        await client('SELECT 1');
        return true;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
}

// Connection pool stats
export function getConnectionStats() {
    return {
        hasConnection: !!connectionString,
        connectionString: connectionString ? 'configured' : 'not configured',
        timestamp: new Date().toISOString()
    };
}

export const sql = getDbClient();
