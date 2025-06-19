import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { conversations, messages } from './schema';

if (!import.meta.env.VITE_DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create the connection
const sql = neon(import.meta.env.VITE_DATABASE_URL!);

// Create the database instance
export const db = drizzle(sql, {
  schema: { conversations, messages },
});

export type Database = typeof db;