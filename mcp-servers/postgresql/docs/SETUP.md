# ✅ MCP Server para PostgreSQL - Setup Rápido

Guía breve y actualizada para instalar y probar el MCP de PostgreSQL.

## 🚀 Instalación (desde la raíz)

```bash
cd mcp-servers && yarn install
cp ../.cursor/mcp.example.json ../.cursor/mcp.json  # editar credenciales
yarn postgres:setup
```

## 🧪 Prueba

```bash
yarn postgres:test
```

Si todo está bien, reinicia Cursor y usa las herramientas `list_tables`, `describe_table`, `get_table_data`, `query_database`.

## 📁 Estructura relevante

```
tramites-be/
├── .cursor/
│   ├── mcp.example.json
│   └── mcp.json                 # gitignored
└── mcp-servers/
    └── postgres/
        ├── src/mcp-postgres-server.js
        └── scripts/{setup.cjs,test.cjs}
```

## Seguridad

- No subas `.cursor/mcp.json` al repo.
- El server rechaza cualquier sentencia que no sea `SELECT`, `WITH` o `EXPLAIN`.
- Conectalo con un rol de solo lectura:

```sql
CREATE ROLE mini_trainer_readonly LOGIN PASSWORD '<password>';
GRANT CONNECT ON DATABASE mini_trainer_dev TO mini_trainer_readonly;
GRANT USAGE ON SCHEMA public TO mini_trainer_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mini_trainer_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mini_trainer_readonly;
```

## 🐛 Troubleshooting

- Asegúrate de que PostgreSQL esté corriendo en `localhost:5432`
- Verifica credenciales en `.cursor/mcp.json`
- Reinstala deps: `yarn mcp:install`