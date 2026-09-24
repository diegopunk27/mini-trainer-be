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

## 🔒 Seguridad

- No subas `.cursor/mcp.json` al repo
- Usa un usuario de DB con permisos mínimos

## 🐛 Troubleshooting

- Asegúrate de que PostgreSQL esté corriendo en `localhost:5432`
- Verifica credenciales en `.cursor/mcp.json`
- Reinstala deps: `yarn mcp:install`