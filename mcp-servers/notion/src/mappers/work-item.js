import { publicId } from '../ids.js';
import { blocksToHtml } from './html-blocks.js';
import { splitSections } from './sections.js';

export const PROPS = {
  title: 'Título',
  type: 'Tipo',
  state: 'Estado',
  parent: 'Padre',
  children: 'Hijos',
  activity: 'Actividad',
  remaining: 'Remaining Work',
  original: 'Original Estimate',
  completed: 'Completed Work',
  agent: 'Agent Completed Work',
  regression: 'Regression Completed Work',
  sprint: 'Sprint',
  area: 'Área',
  assignee: 'Asignado',
  tags: 'Tags',
  phase: 'Fase',
  requirements: 'Requerimientos',
  pr: 'PR',
  branch: 'Rama',
  id: 'ID',
};

function plain(richText = []) {
  return richText.map((item) => item.plain_text || item.text?.content || '').join('');
}

export function readPage(page, prefix) {
  const properties = page.properties || {};
  const unique = properties[PROPS.id]?.unique_id;
  const number = unique?.number ?? null;
  const idPrefix = unique?.prefix || prefix;
  return {
    pageId: page.id,
    url: page.url,
    number,
    id: number,
    publicId: number != null ? publicId(number, idPrefix) : null,
    title: plain(properties[PROPS.title]?.title),
    type: properties[PROPS.type]?.select?.name ?? null,
    state: properties[PROPS.state]?.select?.name ?? null,
    activity: properties[PROPS.activity]?.select?.name ?? null,
    area: properties[PROPS.area]?.select?.name ?? null,
    phase: properties[PROPS.phase]?.select?.name ?? null,
    remainingWork: properties[PROPS.remaining]?.number ?? null,
    originalEstimate: properties[PROPS.original]?.number ?? null,
    completedWork: properties[PROPS.completed]?.number ?? null,
    agentCompletedWork: properties[PROPS.agent]?.number ?? null,
    regressionCompletedWork: properties[PROPS.regression]?.number ?? null,
    tags: (properties[PROPS.tags]?.multi_select || []).map((item) => item.name),
    requirements: (properties[PROPS.requirements]?.multi_select || []).map((item) => item.name),
    assignedTo:
      properties[PROPS.assignee]?.people?.[0]?.person?.email || properties[PROPS.assignee]?.people?.[0]?.name || null,
    parentIds: (properties[PROPS.parent]?.relation || []).map((item) => item.id),
    childIds: (properties[PROPS.children]?.relation || []).map((item) => item.id),
    sprintIds: (properties[PROPS.sprint]?.relation || []).map((item) => item.id),
    pr: properties[PROPS.pr]?.url ?? null,
    branch: plain(properties[PROPS.branch]?.rich_text),
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    lastEditedBy: page.last_edited_by?.name || page.last_edited_by?.id || null,
  };
}

export function toWorkItem(record, blocks, options = {}) {
  const sections = splitSections(blocksToHtml(blocks));
  const summary = {
    id: record.id,
    publicId: record.publicId,
    type: record.type,
    state: record.state,
    title: record.title,
    assignedTo: record.assignedTo,
    url: record.url,
    tags: record.tags,
    activity: record.activity,
    remainingWork: record.remainingWork,
    parent: options.parent ?? null,
  };
  const includePlain = options.includePlainText !== false;
  const fields = [
    ['description', options.includeDescription !== false],
    ['acceptanceCriteria', options.includeAcceptanceCriteria !== false],
    ['reproSteps', record.type === 'Bug' || options.includeReproSteps === true],
    ['systemInfo', record.type === 'Bug' || options.includeSystemInfo === true],
  ];
  for (const [key, enabled] of fields) {
    if (!enabled || !sections[key]) continue;
    summary[key] = sections[key];
    if (includePlain)
      summary[`${key}Plain`] = sections[key]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
  }
  return summary;
}

function textProp(content) {
  return { rich_text: [{ type: 'text', text: { content: String(content) } }] };
}

export function propertiesFromArgs(args) {
  const properties = {};
  if (args.title != null) properties[PROPS.title] = { title: [{ type: 'text', text: { content: args.title } }] };
  if (args.type != null) properties[PROPS.type] = { select: { name: args.type } };
  if (args.state != null) properties[PROPS.state] = { select: { name: args.state } };
  if (args.activity != null) properties[PROPS.activity] = { select: { name: args.activity } };
  if (args.areaPath != null) properties[PROPS.area] = { select: { name: args.areaPath } };
  if (args.phase != null) properties[PROPS.phase] = { select: { name: args.phase } };
  if (args.remainingWork != null) properties[PROPS.remaining] = { number: args.remainingWork };
  if (args.originalEstimate != null) properties[PROPS.original] = { number: args.originalEstimate };
  if (args.completedWork != null) properties[PROPS.completed] = { number: args.completedWork };
  if (args.branch != null) properties[PROPS.branch] = textProp(args.branch);
  if (args.pr != null) properties[PROPS.pr] = { url: args.pr };
  if (Array.isArray(args.requirementIds)) {
    properties[PROPS.requirements] = { multi_select: args.requirementIds.map((name) => ({ name })) };
  }
  if (args.tags != null) {
    const names = Array.isArray(args.tags) ? args.tags : String(args.tags).split(/[;,]/);
    properties[PROPS.tags] = {
      multi_select: names
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ name })),
    };
  }
  if (args.parentId != null) properties[PROPS.parent] = { relation: [{ id: args.parentPageId }] };
  if (args.sprintPageId) properties[PROPS.sprint] = { relation: [{ id: args.sprintPageId }] };
  return properties;
}
