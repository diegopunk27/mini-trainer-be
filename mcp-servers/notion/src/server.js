#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@notionhq/client';
import { HistoryWriter } from './history.js';
import { ThrottledNotion } from './notion-client.js';
import { NotionStore, sprintCsv } from './store.js';
import { PROPS } from './mappers/work-item.js';
import { parseWorkItemId } from './ids.js';

const TOOLS = [
  { name: 'get_work_item', required: ['id'] },
  { name: 'get_parent', required: ['id'] },
  { name: 'get_children', required: ['id'] },
  { name: 'search_work_items', required: ['query'] },
  { name: 'get_board_url', required: [] },
  { name: 'get_attachment', required: [] },
  { name: 'get_work_item_images', required: ['id'] },
  { name: 'get_work_item_attachments', required: ['id'] },
  { name: 'list_tasks', required: [] },
  { name: 'create_work_item', required: ['title'] },
  { name: 'add_work_item_tags', required: ['id', 'tags'] },
  { name: 'add_work_item_comment', required: ['id', 'text'] },
  { name: 'get_work_item_updates', required: ['id'] },
  { name: 'update_work_item', required: ['id'] },
  { name: 'append_execution_note', required: ['id'] },
  { name: 'export_sprint', required: [] },
];

function text(value) {
  return { content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] };
}

export function createServer(store, history, config) {
  const server = new Server({ name: 'notion-mcp-server', version: '1.0.0' }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((tool) => ({
      name: tool.name,
      description: tool.name,
      inputSchema: {
        type: 'object',
        properties: {
          id: { description: '123 or MT-123' },
          query: { type: 'string' },
          title: { type: 'string' },
          text: { type: 'string' },
          note: { type: 'string' },
          tags: {},
          top: { type: 'number' },
          state: { type: 'string' },
          states: { type: 'array' },
          assignedTo: { type: 'string' },
          titleContains: { type: 'string' },
          types: { type: 'array' },
          sprint: { type: 'string' },
          section: { type: 'string' },
          sectionHtml: { type: 'string' },
          description: { type: 'string' },
          includePlainText: { type: 'boolean' },
          includeAcceptanceCriteria: { type: 'boolean' },
          includeDiscussion: { type: 'boolean' },
          includeAttachments: { type: 'boolean' },
          parentId: {},
          type: { type: 'string' },
          activity: { type: 'string' },
          remainingWork: { type: 'number' },
          acceptanceCriteria: { type: 'string' },
          phase: { type: 'string' },
          requirementIds: { type: 'array' },
          url: { type: 'string' },
          attachmentId: { type: 'string' },
          saveToDir: { type: 'string' },
        },
        required: tool.required,
      },
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = request.params.arguments || {};
    try {
      switch (request.params.name) {
        case 'get_work_item':
          return text((await store.workItem(args.id, args)).summary);
        case 'get_parent': {
          const item = await store.workItem(args.id, { ...args, includeDiscussion: false, includeAttachments: false });
          return text({ id: item.summary.id, parent: item.summary.parent });
        }
        case 'get_children':
          return text(await children(store, args));
        case 'search_work_items':
          return text(await search(store, args));
        case 'get_board_url':
          return text(config.boardUrl || '');
        case 'get_attachment':
          return text(await attachment(store, args));
        case 'get_work_item_images':
          return text(await images(store, args));
        case 'get_work_item_attachments':
          return text((await store.workItem(args.id)).summary.attachments || []);
        case 'list_tasks':
          return text(await listTasks(store, config, args));
        case 'create_work_item':
          return text(await store.create(args));
        case 'add_work_item_tags': {
          const current = await store.findById(args.id);
          const tags = Array.from(new Set([...current.tags, ...normalizeTags(args.tags)]));
          const updated = await store.update(args.id, { tags }, history);
          return text({ id: updated.summary.publicId, tags: updated.summary.tags, added: normalizeTags(args.tags) });
        }
        case 'add_work_item_comment': {
          const current = await store.findById(args.id);
          await store.notion.request(() =>
            store.notion.client.comments.create({
              parent: { page_id: current.pageId },
              rich_text: [{ type: 'text', text: { content: args.text } }],
            }),
          );
          return text({ id: args.id, commented: true });
        }
        case 'get_work_item_updates':
          return text(await updates(store, history, args));
        case 'update_work_item':
          return text((await store.update(args.id, args, history)).summary);
        case 'append_execution_note':
          return text((await store.appendNote(args.id, args.text ?? args.note, history)).summary);
        case 'export_sprint':
          return text(await exportSprint(store, args));
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    } catch (error) {
      return text(`Error: ${error.message}`);
    }
  });
  return server;
}

function normalizeTags(value) {
  if (Array.isArray(value)) return value.map(String);
  return String(value)
    .split(/[;,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function query(store, filter, top = 20) {
  const response = await store.notion.request(() =>
    store.notion.client.dataSources.query({ data_source_id: store.config.workItemsDs, filter, page_size: top }),
  );
  return response.results || [];
}

async function search(store, args) {
  const { readPage } = await import('./mappers/work-item.js');
  const pages = await query(store, { property: PROPS.title, title: { contains: args.query } }, args.top || 20);
  return pages.map((page) => readPage(page, store.config.prefix));
}

async function listTasks(store, config, args) {
  const { readPage } = await import('./mappers/work-item.js');
  const filters = [{ property: PROPS.type, select: { equals: 'Task' } }];
  const states = args.states || (args.state ? String(args.state).split(',') : []);
  if (states.length === 1) filters.push({ property: PROPS.state, select: { equals: states[0].trim() } });
  const pages = await query(store, filters.length === 1 ? filters[0] : { and: filters }, args.top || 50);
  return pages
    .map((page) => readPage(page, store.config.prefix))
    .filter((row) => (args.titleContains ? row.title.includes(args.titleContains) : true))
    .filter((row) =>
      args.assignedTo === '@Me'
        ? row.assignedTo === config.meEmail
        : args.assignedTo
          ? row.assignedTo === args.assignedTo
          : true,
    )
    .filter((row) => (states.length > 1 ? states.map((state) => state.trim()).includes(row.state) : true));
}

async function children(store, args) {
  const current = await store.findById(args.id);
  const rows = [];
  for (const pageId of current.childIds) {
    const page = await store.notion.request(() => store.notion.client.pages.retrieve({ page_id: pageId }));
    const { readPage } = await import('./mappers/work-item.js');
    const record = readPage(page, store.config.prefix);
    if (args.types?.length && !args.types.includes(record.type)) continue;
    rows.push({
      id: record.id,
      publicId: record.publicId,
      type: record.type,
      state: record.state,
      title: record.title,
    });
  }
  return rows;
}

async function exportSprint(store, args) {
  const sprintName = args.sprint && args.sprint !== 'current' ? args.sprint : null;
  let sprintPageId;
  if (sprintName) {
    const found = await store.notion.request(() =>
      store.notion.client.dataSources.query({
        data_source_id: store.config.sprintsDs,
        filter: { property: 'Nombre', title: { equals: sprintName } },
        page_size: 1,
      }),
    );
    sprintPageId = found.results?.[0]?.id;
  } else {
    const found = await store.notion.request(() =>
      store.notion.client.dataSources.query({
        data_source_id: store.config.sprintsDs,
        filter: { property: 'Estado', select: { equals: 'Actual' } },
        page_size: 1,
      }),
    );
    sprintPageId = found.results?.[0]?.id;
  }
  const filter = sprintPageId
    ? {
        and: [
          { property: PROPS.type, select: { equals: 'Task' } },
          { property: PROPS.sprint, relation: { contains: sprintPageId } },
        ],
      }
    : { property: PROPS.type, select: { equals: 'Task' } };
  const pages = await query(store, filter, args.top || 200);
  const { readPage, toWorkItem } = await import('./mappers/work-item.js');
  const rows = [];
  for (const page of pages) {
    const record = readPage(page, store.config.prefix);
    const blocks = await store.loadBlocks(record.pageId);
    rows.push(toWorkItem(record, blocks, { includeDiscussion: false }));
  }
  return sprintCsv(rows);
}

async function updates(store, history, args) {
  const record = await store.findById(args.id);
  const items = history ? await history.list(record.pageId) : [];
  return {
    workItemId: record.id,
    publicId: record.publicId,
    limitation:
      'Notion no expone el historial de la página. Estos cambios son los registrados por el MCP en Historial, más la última edición de la página.',
    createdTime: record.createdTime,
    lastEditedTime: record.lastEditedTime,
    lastEditedBy: record.lastEditedBy,
    total: items.length,
    updates: items,
  };
}

async function images(store, args) {
  const item = await store.workItem(args.id);
  return (item.summary.attachments || []).filter(
    (file) => file.name === 'image' || /\.(png|jpe?g|webp|gif)$/i.test(file.url || ''),
  );
}

async function attachment(store, args) {
  if (!args.attachmentId && !args.url) throw new Error('url or attachmentId is required');
  return {
    attachmentId: args.attachmentId || null,
    url: args.url || null,
    note: 'Pedir de nuevo por attachmentId: las URL de Notion vencen en 1 h.',
  };
}

export function configFromEnv(env = process.env) {
  return {
    token: env.NOTION_TOKEN,
    workItemsDs: env.NOTION_WORK_ITEMS_DS,
    sprintsDs: env.NOTION_SPRINTS_DS,
    historyDs: env.NOTION_HISTORY_DS,
    boardUrl: env.NOTION_BOARD_URL,
    meEmail: env.NOTION_ME_EMAIL,
    prefix: env.NOTION_ID_PREFIX || 'MT',
  };
}

const isDirect = process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop());
if (isDirect && process.argv[1].endsWith('server.js')) {
  const config = configFromEnv();
  const client = new Client({ auth: config.token, notionVersion: '2025-09-03' });
  const notion = new ThrottledNotion(client);
  const store = new NotionStore(notion, config);
  const history = new HistoryWriter(notion, config);
  const server = createServer(store, history, config);
  const transport = new StdioServerTransport();
  server.connect(transport).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { parseWorkItemId };
