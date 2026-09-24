#!/usr/bin/env node
const { Client } = require('@notionhq/client');

const token = process.env.NOTION_TOKEN;
const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
const prefix = process.env.NOTION_ID_PREFIX || 'MT';

if (!token || !parentPageId) {
  console.error('Faltan NOTION_TOKEN y NOTION_PARENT_PAGE_ID');
  process.exit(1);
}

const notion = new Client({ auth: token, notionVersion: '2025-09-03' });

function title(content) {
  return [{ type: 'text', text: { content } }];
}

async function createDatabase(name, properties) {
  const database = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: title(name),
    initial_data_source: { properties },
  });
  const dataSourceId = database.data_sources?.[0]?.id;
  console.log(`${name}: database=${database.id} data_source=${dataSourceId || '<COMPLETAR>'}`);
  return database;
}

async function main() {
  const workItems = await createDatabase('Work Items', {
  Título: { title: {} },
  Tipo: { select: { options: ['Epic', 'User Story', 'Task', 'Bug'].map((name) => ({ name })) } },
  Estado: { select: { options: ['New', 'Active', 'Resolved', 'Closed', 'Removed'].map((name) => ({ name })) } },
  Actividad: { select: { options: ['Dev BE', 'Dev FE', 'Dev App', 'Dev'].map((name) => ({ name })) } },
  Área: { select: { options: ['be', 'fe', 'app', 'docs'].map((name) => ({ name })) } },
  Tags: { multi_select: {} },
  Fase: { select: {} },
  Requerimientos: { multi_select: {} },
  'Remaining Work': { number: { format: 'number' } },
  'Original Estimate': { number: { format: 'number' } },
  'Completed Work': { number: { format: 'number' } },
  'Agent Completed Work': { number: { format: 'number' } },
  'Regression Completed Work': { number: { format: 'number' } },
  PR: { url: {} },
  Rama: { rich_text: {} },
  Asignado: { people: {} },
});

const dataSourceId = workItems.data_sources?.[0]?.id;
if (dataSourceId) {
  try {
    await notion.dataSources.update({
      data_source_id: dataSourceId,
      properties: {
        ID: { unique_id: { prefix } },
        Padre: { relation: { data_source_id: dataSourceId, type: 'dual_property', dual_property: { synced_property_name: 'Hijos' } } },
      },
    });
    console.log(`ID unique_id prefix=${prefix} y relación Padre/Hijos creadas`);
  } catch (error) {
    console.error('Paso manual: crear la propiedad ID (unique_id) y la relación Padre/Hijos en Work Items.');
    console.error(error.message);
  }
}

await createDatabase('Sprints', {
  Nombre: { title: {} },
  Fechas: { date: {} },
  Estado: { select: { options: ['Planificado', 'Actual', 'Cerrado'].map((name) => ({ name })) } },
  Objetivo: { rich_text: {} },
});

await createDatabase('Historial', {
  Título: { title: {} },
  Fecha: { date: {} },
  Campo: { rich_text: {} },
  'Valor anterior': { rich_text: {} },
  'Valor nuevo': { rich_text: {} },
  Origen: { select: { options: [{ name: 'MCP' }, { name: 'SNAPSHOT' }] } },
});

console.log('Copiar los data_source ids a NOTION_WORK_ITEMS_DS, NOTION_SPRINTS_DS y NOTION_HISTORY_DS.');
console.log('Relacionar Historial."Work item" y Work Items.Sprint a mano si la API no las creó. Ver docs/SETUP.md.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
