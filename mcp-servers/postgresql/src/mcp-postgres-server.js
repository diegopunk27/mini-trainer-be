#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Client } from 'pg';
import { config } from 'dotenv';

const WRITE_KEYWORDS = /\b(insert|update|delete|drop|alter|truncate|grant|revoke|copy|create|comment|vacuum|call|do)\b/i;

function assertReadOnly(sql) {
  const stripped = String(sql || '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ')
    .trim();
  const withoutTrailing = stripped.replace(/;\s*$/, '');
  if (!withoutTrailing || withoutTrailing.includes(';')) {
    throw new Error('Solo se permite una sentencia de lectura');
  }
  if (!/^(select|with|explain)\b/i.test(withoutTrailing) || WRITE_KEYWORDS.test(withoutTrailing)) {
    throw new Error('El MCP de Postgres es de solo lectura (SELECT, WITH o EXPLAIN)');
  }
}

// Cargar variables de entorno si existe el archivo .env
try {
  config();
} catch (error) {
  // Si no existe .env, las variables vendrán del proceso padre (Cursor)
  // Cursor pasa las variables definidas en .cursor/mcp.json al proceso hijo
  console.error('No .env file found, using environment variables from parent process (Cursor)');
}

class PostgresMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'postgres-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.client = null;
    this.setupToolHandlers();
  }

  async connect() {
    try {
      this.client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'tramites',
      });

      await this.client.connect();
      console.error('Connected to PostgreSQL database');
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error.message);
      throw error;
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'query_database',
            description: 'Execute a SQL query on the PostgreSQL database',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The SQL query to execute',
                },
                params: {
                  type: 'array',
                  description: 'Parameters for the query (optional)',
                  items: {
                    type: 'string',
                  },
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'list_tables',
            description: 'List all tables in the database',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'describe_table',
            description: 'Get the structure of a specific table',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Name of the table to describe',
                },
              },
              required: ['table_name'],
            },
          },
          {
            name: 'get_table_data',
            description: 'Get sample data from a table',
            inputSchema: {
              type: 'object',
              properties: {
                table_name: {
                  type: 'string',
                  description: 'Name of the table',
                },
                limit: {
                  type: 'number',
                  description: 'Number of rows to return (default: 10)',
                  default: 10,
                },
              },
              required: ['table_name'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!this.client) {
        throw new Error('Database connection not established');
      }

      try {
        switch (name) {
          case 'query_database':
            return await this.handleQueryDatabase(args);

          case 'list_tables':
            return await this.handleListTables();

          case 'describe_table':
            return await this.handleDescribeTable(args);

          case 'get_table_data':
            return await this.handleGetTableData(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async handleQueryDatabase(args) {
    const { query, params = [] } = args;
    assertReadOnly(query);

    const result = await this.client.query(query, params);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              rowCount: result.rowCount,
              rows: result.rows,
              fields: result.fields.map((f) => f.name),
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async handleListTables() {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    const result = await this.client.query(query);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              tables: result.rows.map((row) => row.table_name),
              count: result.rowCount,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async handleDescribeTable(args) {
    const { table_name: tableName } = args;

    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position;
    `;

    const result = await this.client.query(query, [tableName]);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              table: tableName,
              columns: result.rows,
              count: result.rowCount,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async handleGetTableData(args) {
    const { table_name: tableName, limit = 10 } = args;

    const query = `SELECT * FROM "${tableName}" LIMIT $1`;
    const result = await this.client.query(query, [limit]);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              table: tableName,
              rows: result.rows,
              count: result.rowCount,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    await this.connect();
    console.error('PostgreSQL MCP Server is running');
  }

  async close() {
    if (this.client) {
      await this.client.end();
    }
  }
}

// Manejo de señales para cerrar limpiamente
process.on('SIGINT', async () => {
  const server = new PostgresMCPServer();
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  const server = new PostgresMCPServer();
  await server.close();
  process.exit(0);
});

// Ejecutar el servidor
const server = new PostgresMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
