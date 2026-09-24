import { PROPS } from './mappers/work-item.js';

export class HistoryWriter {
  constructor(notion, config) {
    this.notion = notion;
    this.config = config;
  }

  async record(record, change) {
    if (!this.config.historyDs) return null;
    const entries = Object.entries(change).filter(([, value]) => value != null && value !== '');
    const created = [];
    for (const [field, value] of entries) {
      const page = await this.notion.request(() =>
        this.notion.client.pages.create({
          parent: { type: 'data_source_id', data_source_id: this.config.historyDs },
          properties: {
            Título: { title: [{ type: 'text', text: { content: `${record.publicId} ${field}` } }] },
            'Work item': { relation: [{ id: record.pageId }] },
            Fecha: { date: { start: new Date().toISOString() } },
            Campo: { rich_text: [{ type: 'text', text: { content: field } }] },
            'Valor nuevo': { rich_text: [{ type: 'text', text: { content: String(value).slice(0, 2000) } }] },
            Origen: { select: { name: 'MCP' } },
          },
        }),
      );
      created.push(page.id);
    }
    return created;
  }

  async list(pageId) {
    if (!this.config.historyDs) return [];
    const response = await this.notion.request(() =>
      this.notion.client.dataSources.query({
        data_source_id: this.config.historyDs,
        filter: { property: 'Work item', relation: { contains: pageId } },
        sorts: [{ property: 'Fecha', direction: 'descending' }],
      }),
    );
    return (response.results || []).map((page) => {
      const properties = page.properties || {};
      const field = plain(properties.Campo?.rich_text);
      return {
        id: page.id,
        changedDate: properties.Fecha?.date?.start || page.created_time,
        revisedBy: 'MCP',
        fields: {
          [field || 'change']: {
            oldValue: plain(properties['Valor anterior']?.rich_text) || null,
            newValue: plain(properties['Valor nuevo']?.rich_text) || null,
          },
        },
      };
    });
  }
}

function plain(richText = []) {
  return (richText || []).map((item) => item.plain_text || '').join('');
}

export { PROPS };
