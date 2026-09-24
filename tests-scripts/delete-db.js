/* eslint-disable */
const { Client } = require('pg');

function quoteIdent(name) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error(`Invalid database name: ${name}`);
  }
  return `"${name}"`;
}

async function deleteDatabase() {
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
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdent(dbName)}`);
    console.log(`Database '${dbName}' deleted successfully`);
  } catch (error) {
    console.error('Error deleting database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deleteDatabase();
