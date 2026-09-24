#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando MCP Server para PostgreSQL...');

// Verificar que estamos en el directorio correcto
const serverFile = path.join(__dirname, '..', 'src', 'mcp-postgres-server.js');
if (!fs.existsSync(serverFile)) {
  console.log('❌ Error: No se encontró el servidor MCP. Asegúrate de estar en el directorio correcto.');
  process.exit(1);
}

console.log('✅ Servidor MCP encontrado');

// Verificar que las dependencias estén instaladas
const nodeModulesDir = path.join(__dirname, '..', '..', 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  console.log('❌ Error: Dependencias no instaladas. Ejecuta "cd mcp-servers && yarn install" primero.');
  process.exit(1);
}

console.log('✅ Dependencias verificadas');

console.log('');
console.log('🎉 Configuración completada!');
console.log('');
console.log('📝 Próximos pasos:');
console.log('1. Edita el archivo .cursor/mcp.json y actualiza las credenciales de tu base de datos');
console.log('2. Asegúrate de que PostgreSQL esté ejecutándose');
console.log('3. Reinicia Cursor para que los cambios tomen efecto');
console.log('');
console.log('🔧 Para probar la conexión, ejecuta:');
console.log('   cd mcp-servers && yarn postgres:test');
console.log('');
console.log('📚 Herramientas disponibles:');
console.log('   - query_database: Ejecutar consultas SQL personalizadas');
console.log('   - list_tables: Listar todas las tablas');
console.log('   - describe_table: Ver estructura de una tabla');
console.log('   - get_table_data: Obtener datos de muestra de una tabla'); 