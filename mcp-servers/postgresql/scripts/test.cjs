#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Probando conexión MCP con PostgreSQL...');

// Verificar que estamos en el directorio correcto
const serverFile = path.join(__dirname, '..', 'src', 'mcp-postgres-server.js');
if (!fs.existsSync(serverFile)) {
  console.log('❌ Error: No se encontró el servidor MCP.');
  process.exit(1);
}

// Verificar que las dependencias estén instaladas
const nodeModulesDir = path.join(__dirname, '..', '..', 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  console.log('❌ Error: Dependencias no instaladas. Ejecuta "cd mcp-servers && yarn install" primero.');
  process.exit(1);
}

console.log('✅ Servidor MCP encontrado');
console.log('✅ Dependencias verificadas');

// Intento opcional de verificación con pg_isready (si está disponible)
console.log('🔍 Verificando PostgreSQL (opcional)...');
try {
  execSync('pg_isready -h localhost -p 5432', { stdio: 'pipe' });
  console.log('✅ PostgreSQL responde en localhost:5432');
} catch (error) {
  console.log('ℹ️  No se pudo verificar con pg_isready. Continuando con la prueba de conexión del servidor...');
}

// Preparar variables de entorno para la prueba leyendo .cursor/mcp.json si existe
console.log('🔌 Preparando entorno de prueba...');
let env = { ...process.env };

try {
  const repoRoot = path.join(__dirname, '..', '..', '..');
  const mcpConfigPath = path.join(repoRoot, '.cursor', 'mcp.json');
  if (fs.existsSync(mcpConfigPath)) {
    const configRaw = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(configRaw);
    const pgEnv = config?.mcpServers?.postgres?.env || {};
    env = { ...env, ...pgEnv };
    console.log('✅ Credenciales cargadas desde .cursor/mcp.json');
  } else {
    console.log('ℹ️  No se encontró .cursor/mcp.json. Usando variables de entorno del sistema si están definidas.');
  }
} catch (e) {
  console.log('⚠️  No se pudieron cargar credenciales desde .cursor/mcp.json. Detalle:', e.message);
}

// Ejecutar el servidor en modo de prueba
const serverProcess = spawn('node', [serverFile], {
  env,
  stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  output += data.toString();
});

serverProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Detener el servidor después de 10 segundos
setTimeout(() => {
  serverProcess.kill();
}, 10000);

serverProcess.on('close', (code) => {
  // Verificar si el servidor se conectó exitosamente
  if (output.includes('Connected to PostgreSQL database') || errorOutput.includes('Connected to PostgreSQL database')) {
    console.log('✅ Conexión exitosa! El servidor MCP está funcionando correctamente.');
    console.log('');
    console.log('🎉 ¡Todo listo! Ahora puedes:');
    console.log('1. Reiniciar Cursor');
    console.log('2. Usar las herramientas MCP para consultar tu base de datos');
    console.log('');
    console.log('📚 Herramientas disponibles:');
    console.log('   - list_tables: Listar todas las tablas');
    console.log('   - describe_table: Ver estructura de una tabla');
    console.log('   - get_table_data: Obtener datos de muestra');
    console.log('   - query_database: Ejecutar consultas SQL personalizadas');
    process.exit(0);
  } else {
    console.log('❌ Error en la conexión. Verifica que PostgreSQL esté ejecutándose y las credenciales en .cursor/mcp.json');
    console.log('📋 Log del servidor:');
    console.log(output);
    console.log(errorOutput);
    process.exit(1);
  }
}); 