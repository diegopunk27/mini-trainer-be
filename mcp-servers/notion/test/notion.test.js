import assert from 'node:assert/strict';
import test from 'node:test';
import { parseWorkItemId, publicId } from '../src/ids.js';
import { chunk, ThrottledNotion } from '../src/notion-client.js';
import { batchBlocks, blocksToHtml, chunkRichText, htmlToBlocks } from '../src/mappers/html-blocks.js';
import { appendExecutionNote, replaceSection } from '../src/mappers/sections.js';
import { HistoryWriter } from '../src/history.js';

test('parseWorkItemId accepts the number and the prefix', () => {
  assert.equal(parseWorkItemId(123, 'MT'), 123);
  assert.equal(parseWorkItemId('MT-123', 'MT'), 123);
  assert.equal(parseWorkItemId('mt-8', 'MT'), 8);
  assert.equal(publicId(8, 'MT'), 'MT-8');
  assert.throws(() => parseWorkItemId('ABC', 'MT'));
});

test('html blocks round-trip headings, lists and bold', () => {
  const html = '<h2>Descripción</h2><p>Hola <strong>mundo</strong></p><ul><li>uno</li><li>dos</li></ul>';
  const blocks = htmlToBlocks(html);
  assert.equal(blocks[0].type, 'heading_2');
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(
    blocks[1].paragraph.rich_text.some((span) => span.annotations.bold),
    true,
  );
  assert.equal(blocks.filter((block) => block.type === 'bulleted_list_item').length, 2);
  const back = blocksToHtml(blocks);
  assert.match(back, /<h2>Descripción<\/h2>/);
  assert.match(back, /<strong>mundo<\/strong>/);
  assert.match(back, /<li>uno<\/li>/);
});

test('rich text splits at 2000 characters and blocks batch by 100', () => {
  const spans = chunkRichText([{ type: 'text', text: { content: 'a'.repeat(4500) }, annotations: {} }]);
  assert.equal(spans.length, 3);
  assert.equal(spans[0].text.content.length, 2000);
  assert.equal(batchBlocks(Array.from({ length: 250 }, () => ({ type: 'paragraph' }))).length, 3);
  assert.equal(chunk([1, 2, 3, 4], 3).length, 2);
});

test('section replace keeps execution notes and append adds a list item', () => {
  const html = '<h2>Descripción</h2><p>plan</p><h2>Notas de ejecución</h2><ul><li>vieja</li></ul>';
  const replaced = replaceSection(html, 'Descripción', '<p>nuevo</p>');
  assert.match(replaced, /<p>nuevo<\/p>/);
  assert.match(replaced, /<li>vieja<\/li>/);
  assert.throws(() => replaceSection(html, 'Notas de ejecución', '<p>x</p>'), /append_execution_note/);
  const appended = appendExecutionNote(replaced, 'nueva');
  assert.match(appended, /<li>vieja<\/li><li>nueva<\/li>/);
  assert.match(appended, /<p>nuevo<\/p>/);
});

test('throttle retries 429 using Retry-After', async () => {
  const sleeps = [];
  let calls = 0;
  const client = {};
  const notion = new ThrottledNotion(client, {
    intervalMs: 0,
    now: () => 0,
    sleep: async (ms) => sleeps.push(ms),
  });
  const value = await notion.request(async () => {
    calls += 1;
    if (calls === 1) {
      const error = new Error('rate');
      error.status = 429;
      error.headers = { get: (name) => (name === 'retry-after' ? '2' : null) };
      throw error;
    }
    return 'ok';
  });
  assert.equal(value, 'ok');
  assert.equal(calls, 2);
  assert.ok(sleeps.includes(2000));
});

test('history writer stores one row per changed field', async () => {
  const created = [];
  const notion = {
    request: (fn) => fn(),
    client: {
      pages: {
        create: async (body) => {
          created.push(body);
          return { id: `h-${created.length}` };
        },
      },
    },
  };
  const history = new HistoryWriter(notion, { historyDs: 'ds-history' });
  await history.record({ publicId: 'MT-1', pageId: 'page-1' }, { state: 'Active', title: '' });
  assert.equal(created.length, 1);
  assert.equal(created[0].properties.Campo.rich_text[0].text.content, 'state');
  assert.equal(created[0].properties.Origen.select.name, 'MCP');
});
