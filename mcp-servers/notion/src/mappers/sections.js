export const SECTIONS = [
  { key: 'description', title: 'Descripción' },
  { key: 'acceptanceCriteria', title: 'Criterios de aceptación' },
  { key: 'reproSteps', title: 'Pasos para reproducir' },
  { key: 'systemInfo', title: 'Info del sistema' },
  { key: 'executionNotes', title: 'Notas de ejecución' },
];

export function normalizeTitle(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function sectionByTitle(title) {
  const wanted = normalizeTitle(title);
  return SECTIONS.find((section) => normalizeTitle(section.title) === wanted) ?? null;
}

export function emptySections() {
  return Object.fromEntries(SECTIONS.map((section) => [section.key, '']));
}

export function splitSections(html) {
  const sections = emptySections();
  const source = html ?? '';
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  const marks = [];
  let match;
  while ((match = re.exec(source)) !== null) {
    const section = sectionByTitle(match[1].replace(/<[^>]+>/g, ''));
    if (!section) continue;
    marks.push({ key: section.key, bodyStart: re.lastIndex, headingStart: match.index });
  }
  marks.forEach((mark, index) => {
    const end = marks[index + 1]?.headingStart ?? source.length;
    sections[mark.key] = source.slice(mark.bodyStart, end).trim();
  });
  if (marks.length === 0 && source.trim()) sections.description = source.trim();
  return sections;
}

export function joinSections(sections) {
  return SECTIONS.map((section) => {
    const body = sections[section.key];
    if (!body) return '';
    return `<h2>${section.title}</h2>${body}`;
  })
    .filter(Boolean)
    .join('');
}

export function replaceSection(html, title, innerHtml) {
  const section = sectionByTitle(title);
  if (!section) throw new Error(`Section not found: ${title}`);
  if (section.key === 'executionNotes') throw new Error('Use append_execution_note to change Notas de ejecución');
  const sections = splitSections(html);
  sections[section.key] = innerHtml ?? '';
  return joinSections(sections);
}

function escapeText(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

export function appendExecutionNote(html, note) {
  const raw = String(note ?? '').trim();
  if (!raw) throw new Error('text is required');
  const inner = /<[a-z][\s\S]*>/i.test(raw) ? raw : escapeText(raw);
  const sections = splitSections(html);
  const item = `<li>${inner}</li>`;
  if (!sections.executionNotes) {
    sections.executionNotes = `<ul>${item}</ul>`;
  } else if (sections.executionNotes.includes('</ul>')) {
    sections.executionNotes = sections.executionNotes.replace(/<\/ul>\s*$/i, `${item}</ul>`);
  } else {
    sections.executionNotes = `${sections.executionNotes}<ul>${item}</ul>`;
  }
  return joinSections(sections);
}
