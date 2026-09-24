# MCP Server para PostgreSQL

Este servidor MCP (Model Context Protocol) te permite conectar Cursor con tu base de datos PostgreSQL local para realizar consultas y explorar la estructura de la base de datos directamente desde el editor.

## 🚀 Instalación Rápida

1. **Ejecutar el setup de Postgres:**
   ```bash
   cd mcp-servers && yarn install && yarn postgres:setup
   ```

2. **Configurar credenciales de la base de datos:**
   Edita el archivo `.cursor/mcp.json` y actualiza las credenciales:
   ```json
    {
      "mcpServers": {
        "postgres": {
          "command": "node",
          "args": ["mcp-servers/postgres/src/mcp-postgres-server.js"],
          "env": {
           "DB_HOST": "localhost",
           "DB_PORT": "5432",
           "DB_USERNAME": "tu_usuario",
           "DB_PASSWORD": "tu_contraseña",
           "DB_DATABASE": "tu_base_de_datos"
         }
       }
     }
   }
   ```

3. **Reiniciar Cursor** para que los cambios tomen efecto.

4. **Verificar la conexión:**
   ```bash
   yarn postgres:test
   ```

## 📚 Herramientas Disponibles

### 1. `query_database`
Ejecuta consultas SQL personalizadas en la base de datos.

**Parámetros:**
- `query` (requerido): La consulta SQL a ejecutar
- `params` (opcional): Array de parámetros para la consulta

**Ejemplo:**
```sql
SELECT * FROM users WHERE email = $1
```

### 2. `list_tables`
Lista todas las tablas disponibles en la base de datos.

**Parámetros:** Ninguno

### 3. `describe_table`
Muestra la estructura de una tabla específica.

**Parámetros:**
- `table_name` (requerido): Nombre de la tabla

### 4. `get_table_data`
Obtiene datos de muestra de una tabla.

**Parámetros:**
- `table_name` (requerido): Nombre de la tabla
- `limit` (opcional): Número de filas a retornar (por defecto: 10)

## 🔧 Configuración Manual

Si prefieres configurar manualmente:

1. **Instalar dependencias:**
   ```bash
   cd mcp-servers
   yarn install
   ```

2. **Configurar variables de entorno:**
   Las variables de entorno se configuran en `.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "postgres": {
         "env": {
           "DB_HOST": "localhost",
           "DB_PORT": "5432",
           "DB_USERNAME": "tu_usuario",
           "DB_PASSWORD": "tu_contraseña",
           "DB_DATABASE": "tu_base_de_datos"
         }
       }
     }
   }
   ```

3. **Probar la conexión:**
   ```bash
   yarn postgres:test
   ```

## 🛠️ Uso en Cursor

Una vez configurado, podrás usar las herramientas directamente en Cursor:

1. **Listar tablas:**
   - Usa la herramienta `list_tables` para ver todas las tablas disponibles

2. **Explorar estructura:**
   - Usa `describe_table` con el nombre de una tabla para ver su estructura

3. **Consultar datos:**
   - Usa `query_database` para ejecutar consultas SQL personalizadas
   - Usa `get_table_data` para obtener datos de muestra

## 🔒 Seguridad

- **Nunca** incluyas credenciales sensibles en el código
- Usa variables de entorno para las credenciales
- Considera usar un usuario de base de datos con permisos limitados
- El servidor MCP solo se ejecuta localmente

## 🐛 Solución de Problemas

### Error de conexión
- Verifica que PostgreSQL esté ejecutándose
- Confirma que las credenciales sean correctas
- Asegúrate de que el puerto 5432 esté disponible

### Error de dependencias
- Ejecuta `yarn mcp:install`
- Verifica que Node.js esté instalado y que Yarn o npm funcionen correctamente

### Error de permisos
- Asegúrate de que el usuario de la base de datos tenga permisos de lectura
- Verifica que la base de datos exista

## 📁 Estructura de Archivos

```
tramites-be/
├── .cursor/
│   ├── mcp.example.json            # Template de config (en repo)
│   └── mcp.json                    # Config real (gitignored)
└── mcp-servers/
    ├── package.json
    └── postgres/
        ├── src/mcp-postgres-server.js
        ├── scripts/setup.cjs
        └── scripts/test.cjs
```

## 🤝 Contribuir

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles. 