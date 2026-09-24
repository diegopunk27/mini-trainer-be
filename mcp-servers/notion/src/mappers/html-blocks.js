const TEXT_LIMIT = 2000;
const BLOCK_BATCH = 100;

function rich(content, annotations = {}, link) {
  const text = { content };
  if (link) text.link = { url: link };
  return {
    type: 'text',
    text,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default',
      ...annotations,
    },
  };
}

export function chunkRichText(spans, limit = TEXT_LIMIT) {
  const out = [];
  for (const span of spans) {
    let rest = span.text.content;
    while (rest.length > limit) {
      out.push(rich(rest.slice(0, limit), span.annotations, span.text.link?.url));
      rest = rest.slice(limit);
    }
    if (rest) out.push(rich(rest, span.annotations, span.text.link?.url));
  }
  return out;
}

function parseInline(html) {
  const spans = [];
  const re = /<(\/?)(strong|b|em|i|code|a|br)\b([^>]*)>|[^<]+/gi;
  const marks = [];
  let match;
  while ((match = re.exec(html)) !== null) {
    if (match[0].startsWith('<')) {
      const tag = match[2].toLowerCase();
      if (tag === 'br' && !match[1]) {
        spans.push(rich('\n', currentAnnotations(marks)));
        continue;
      }
      if (match[1]) {
        const index = marks.map((item) => item.tag).lastIndexOf(tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag);
        if (index >= 0) marks.splice(index, 1);
        continue;
      }
      const href = /href=["']([^"']+)["']/i.exec(match[3])?.[1];
      marks.push({ tag: tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag, href });
      continue;
    }
    if (match[0]) spans.push(rich(decode(match[0]), currentAnnotations(marks), marks.find((item) => item.href)?.href));
  }
  return chunkRichText(spans.filter((span) => span.text.content.length > 0));
}

function currentAnnotations(marks) {
  return {
    bold: marks.some((item) => item.tag === 'strong'),
    italic: marks.some((item) => item.tag === 'em'),
    code: marks.some((item) => item.tag === 'code'),
  };
}

function decode(value) {
  return value.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function encode(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function block(type, spans, extra = {}) {
  return { object: 'block', type, [type]: { rich_text: spans, ...extra } };
}

export function htmlToBlocks(html) {
  const blocks = [];
  const re = /<(p|h1|h2|h3|ul|ol|pre|img)\b([^>]*)>([\s\S]*?)<\/\1>|<img\b([^>]*)\/?>/gi;
  let match;
  const source = html ?? '';
  while ((match = re.exec(source)) !== null) {
    if (match[1] == null) {
      const src = /src=["']([^"']+)["']/i.exec(match[4])?.[1];
      if (src) blocks.push({ object: 'block', type: 'image', image: { type: 'external', external: { url: src } } });
      continue;
    }
    const tag = match[1].toLowerCase();
    const inner = match[3];
    if (tag === 'img') {
      const src = /src=["']([^"']+)["']/i.exec(match[2])?.[1];
      if (src) blocks.push({ object: 'block', type: 'image', image: { type: 'external', external: { url: src } } });
      continue;
    }
    if (tag === 'ul' || tag === 'ol') {
      blocks.push(...listToBlocks(inner, tag === 'ol' ? 'numbered_list_item' : 'bulleted_list_item'));
      continue;
    }
    if (tag === 'pre') {
      blocks.push(
        block('code', chunkRichText([rich(decode(inner.replace(/<[^>]+>/g, '')))]), { language: 'plain text' }),
      );
      continue;
    }
    const type = tag === 'p' ? 'paragraph' : tag === 'h1' ? 'heading_1' : tag === 'h2' ? 'heading_2' : 'heading_3';
    blocks.push(block(type, parseInline(inner)));
  }
  return blocks;
}

function listToBlocks(html, type) {
  const items = [];
  const re = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const nested = /<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/i.exec(match[1]);
    const own = nested ? match[1].slice(0, nested.index) : match[1];
    const item = block(type, parseInline(own));
    if (nested) {
      const childType = nested[1].toLowerCase() === 'ol' ? 'numbered_list_item' : 'bulleted_list_item';
      item[type].children = listToBlocks(nested[2], childType);
    }
    items.push(item);
  }
  return items;
}

function spansToHtml(spans = []) {
  return spans
    .map((span) => {
      let text = encode(span.plain_text || span.text?.content || '').replace(/\n/g, '<br>');
      const ann = span.annotations || {};
      if (ann.code) text = `<code>${text}</code>`;
      if (ann.bold) text = `<strong>${text}</strong>`;
      if (ann.italic) text = `<em>${text}</em>`;
      const url = span.text?.link?.url || span.href;
      if (url) text = `<a href="${encode(url)}">${text}</a>`;
      return text;
    })
    .join('');
}

export function blocksToHtml(blocks = []) {
  return blocks
    .map((item) => {
      const data = item[item.type] || {};
      if (item.type === 'paragraph') return `<p>${spansToHtml(data.rich_text)}</p>`;
      if (item.type === 'heading_1') return `<h1>${spansToHtml(data.rich_text)}</h1>`;
      if (item.type === 'heading_2') return `<h2>${spansToHtml(data.rich_text)}</h2>`;
      if (item.type === 'heading_3') return `<h3>${spansToHtml(data.rich_text)}</h3>`;
      if (item.type === 'code') return `<pre>${spansToHtml(data.rich_text)}</pre>`;
      if (item.type === 'image') {
        const url = data.external?.url || data.file?.url || '';
        return url ? `<img src="${encode(url)}">` : '';
      }
      if (item.type === 'bulleted_list_item' || item.type === 'numbered_list_item') {
        const tag = item.type === 'numbered_list_item' ? 'ol' : 'ul';
        const children = data.children?.length ? blocksToHtml(data.children) : '';
        return `<${tag}><li>${spansToHtml(data.rich_text)}${children}</li></${tag}>`;
      }
      return '';
    })
    .join('');
}

export function batchBlocks(blocks, size = BLOCK_BATCH) {
  const batches = [];
  for (let index = 0; index < blocks.length; index += size) batches.push(blocks.slice(index, index + size));
  return batches;
}

export { BLOCK_BATCH, TEXT_LIMIT };
