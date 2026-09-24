import { chunk } from './notion-client.js';
import { parseWorkItemId } from './ids.js';
import { batchBlocks, blocksToHtml, htmlToBlocks } from './mappers/html-blocks.js';
import { appendExecutionNote, joinSections, replaceSection, splitSections } from './mappers/sections.js';
import { PROPS, propertiesFromArgs, readPage, toWorkItem } from './mappers/work-item.js';

export class NotionStore {
  constructor(notion, config) {
    this.notion = notion;
    this.config = config;
  }

  async findById(id) {
    const number = parseWorkItemId(id, this.config.prefix);
    const response = await this.notion.request(() =>
      this.notion.client.dataSources.query({
        data_source_id: this.config.workItemsDs,
        filter: { property: PROPS.id, unique_id: { equals: number } },
        page_size: 1,
      }),
    );
    const page = response.results?.[0];
    if (!page) throw new Error(`Work item not found: ${id}`);
    return readPage(page, this.config.prefix);
  }

  async loadBlocks(pageId) {
    const blocks = [];
    let cursor;
    do {
      const response = await this.notion.request(() =>
        this.notion.client.blocks.children.list({ block_id: pageId, start_cursor: cursor, page_size: 100 }),
      );
      blocks.push(...(response.results || []));
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);
    return blocks;
  }

  async workItem(id, options = {}) {
    const record = await this.findById(id);
    const blocks = await this.loadBlocks(record.pageId);
    let parent = null;
    if (record.parentIds[0]) {
      const parentPage = await this.notion.request(() =>
        this.notion.client.pages.retrieve({ page_id: record.parentIds[0] }),
      );
      const parentRecord = readPage(parentPage, this.config.prefix);
      const parentBlocks = options.includeParentBody === false ? [] : await this.loadBlocks(parentRecord.pageId);
      parent = toWorkItem(parentRecord, parentBlocks, options);
    }
    const summary = toWorkItem(record, blocks, { ...options, parent });
    if (options.includeDiscussion !== false) summary.discussion = await this.listComments(record.pageId);
    if (options.includeAttachments !== false) summary.attachments = attachmentMeta(blocks);
    return { record, blocks, summary };
  }

  async listComments(pageId) {
    const response = await this.notion.request(() => this.notion.client.comments.list({ block_id: pageId }));
    return (response.results || []).map((comment) => ({
      id: comment.id,
      text: (comment.rich_text || []).map((item) => item.plain_text).join(''),
      createdAt: comment.created_time,
      author: comment.created_by?.name || comment.created_by?.id || null,
    }));
  }

  async replaceBody(pageId, html) {
    const existing = await this.loadBlocks(pageId);
    for (const block of existing) {
      await this.notion.request(() => this.notion.client.blocks.delete({ block_id: block.id }));
    }
    const batches = batchBlocks(htmlToBlocks(html));
    for (const children of batches) {
      if (children.length === 0) continue;
      await this.notion.request(() => this.notion.client.blocks.children.append({ block_id: pageId, children }));
    }
  }

  async update(id, args, history) {
    const current = await this.workItem(id, { includeDiscussion: false, includeAttachments: false });
    const properties = propertiesFromArgs(args);
    if (Object.keys(properties).length > 0) {
      await this.notion.request(() => this.notion.client.pages.update({ page_id: current.record.pageId, properties }));
    }
    if (args.section || args.description != null) {
      const html = blocksToHtml(current.blocks);
      const next = args.section
        ? replaceSection(html, args.section, args.sectionHtml ?? args.description)
        : joinSections({ ...splitSections(html), description: args.description });
      await this.replaceBody(current.record.pageId, next);
    }
    if (history) await history.record(current.record, args);
    return this.workItem(id, { includeDiscussion: false, includeAttachments: false });
  }

  async appendNote(id, text, history) {
    const current = await this.workItem(id, { includeDiscussion: false, includeAttachments: false });
    const next = appendExecutionNote(blocksToHtml(current.blocks), text);
    await this.replaceBody(current.record.pageId, next);
    if (history) await history.record(current.record, { executionNote: text });
    return this.workItem(id, { includeDiscussion: false, includeAttachments: false });
  }

  async create(args) {
    const properties = propertiesFromArgs({ ...args, type: args.type || 'Task' });
    const sections = {
      description: args.description || '',
      acceptanceCriteria: args.acceptanceCriteria || '',
      reproSteps: args.reproSteps || '',
      systemInfo: args.systemInfo || '',
      executionNotes: '',
    };
    const children = htmlToBlocks(joinSections(sections)).slice(0, 100);
    const page = await this.notion.request(() =>
      this.notion.client.pages.create({
        parent: { type: 'data_source_id', data_source_id: this.config.workItemsDs },
        properties,
        children,
      }),
    );
    return readPage(page, this.config.prefix);
  }
}

function attachmentMeta(blocks) {
  return blocks
    .filter((block) => block.type === 'file' || block.type === 'pdf' || block.type === 'image')
    .map((block) => ({
      attachmentId: block.id,
      name: block[block.type]?.name || block.type,
      url: block[block.type]?.file?.url || block[block.type]?.external?.url || null,
    }));
}

export function sprintCsv(rows) {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Assigned To',
    'State',
    'Remaining Work',
    'Original Estimate',
    'Completed Work',
    'Agent Completed Work',
    'Regression Completed Work',
    'Tags',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = [
      row.publicId || row.id,
      row.title,
      row.descriptionPlain || row.description || '',
      row.assignedTo || '',
      row.state || '',
      row.remainingWork ?? '',
      row.originalEstimate ?? '',
      row.completedWork ?? '',
      row.agentCompletedWork ?? '',
      row.regressionCompletedWork ?? '',
      (row.tags || []).join('; '),
    ];
    lines.push(values.map(csvCell).join(','));
  }
  return lines.join('\n');
}

function csvCell(value) {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export { chunk };
