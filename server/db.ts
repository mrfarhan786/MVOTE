import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

// Use environment variables
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432');
const dbName = process.env.DB_NAME || 'mvotedb';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'root'; 
const dbSsl = process.env.DB_SSL === 'true'; 

const createPool = () => {
  try {
    return new Pool({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: dbSsl,
      max: 20,
      connectionTimeoutMillis: 10000
    });
  } catch (error) {
    console.error('Failed to create database pool:', error);
    throw error;
  }
};

export const pool = createPool();

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  // Don't exit the process, just log the error
  // process.exit(-1);
});

export const db = drizzle(pool, { schema });

// Test the connection without exiting on error
pool.connect()
  .then(client => {
    console.log('Database connection successful');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    // Don't exit the process, just log the error
    // process.exit(-1);
  });
