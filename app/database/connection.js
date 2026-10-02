import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Termux local connection pool setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('❌ Unexpected Database Error:', err);
});

export const db = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    close: () => pool.end()
};

export default db;
