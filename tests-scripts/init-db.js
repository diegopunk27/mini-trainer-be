/* eslint-disable */
const { Client } = require('pg');

function quoteIdent(name) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid database name: ${name}`);
  }
  return `"${name}"`;
}

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root_password',
    database: 'postgres',
  });

  const dbName = process.env.DB_DATABASE || 'mini_trainer_testing';

  try {
    await client.connect();
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdent(dbName)}`);
    }
    console.log(`Database '${dbName}' created successfully`);
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
