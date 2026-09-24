#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const COMMANDS = new Set(['validate-config', 'upload-attachment']);

function usage() {
  console.log(`Usage:
  node dev-utils.mjs validate-config --config <dev-project-config.md>
  node dev-utils.mjs upload-attachment --config <dev-project-config.md> --work-item <id> --file <path> [--name <fileName>] [--comment <text>] [--pat <token>]

upload-attachment requiere ADO_PAT, AZURE_DEVOPS_EXT_PAT o el flag --pat con permiso Work Items (Read & write).
--name define el nombre visible del adjunto en ADO (por defecto usa el nombre del archivo local).`);
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index === process.argv.length - 1) return null;
  return process.argv[index + 1];
}

function getField(text, label) {
  const pattern = new RegExp('- \\*\\*' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\*: `?([^\\n`]+)`?', 'i');
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function parseConfig(configPath) {
  const text = fs.readFileSync(configPath, 'utf8');
  const trackerMatch = text.match(/\*\*Tracker\*\*:\s*`?([a-z]+)`?/i);
  return {
    tracker: (trackerMatch ? trackerMatch[1] : 'ado').toLowerCase(),
    idPrefix: getField(text, 'ID prefix'),
    projectId: getField(text, 'Azure DevOps Project ID'),
    projectName: getField(text, 'Azure DevOps Project Name'),
    organization: getField(text, 'Azure DevOps Organization'),
    notionUs: getField(text, 'Notion US data source id'),
    notionTask: getField(text, 'Notion Task data source id'),
    notionBug: getField(text, 'Notion Bug data source id'),
    notionBoard: getField(text, 'Notion Board URL'),
    text,
  };
}

function isIncomplete(value) {
  return !value || value.includes('<COMPLETAR_');
}

function validateConfig(configPath) {
  const config = parseConfig(configPath);
  const errors = [];

  if (!['ado', 'notion'].includes(config.tracker)) {
    errors.push('Tracker debe ser ado o notion');
  }
  if (isIncomplete(config.idPrefix)) errors.push('ID prefix esta incompleto');

  if (config.tracker === 'ado') {
    const projectFields = [
      ['Azure DevOps Project ID', config.projectId],
      ['Azure DevOps Project Name', config.projectName],
      ['Azure DevOps Organization', config.organization],
    ];
    for (const [label, value] of projectFields) {
      if (isIncomplete(value)) errors.push(`${label} esta incompleto`);
    }
  }

  if (config.tracker === 'notion') {
    const notionFields = [
      ['Notion US data source id', config.notionUs],
      ['Notion Task data source id', config.notionTask],
      ['Notion Bug data source id', config.notionBug],
      ['Notion Board URL', config.notionBoard],
    ];
    for (const [label, value] of notionFields) {
      if (isIncomplete(value)) errors.push(`${label} esta incompleto`);
    }
  }

  const repoBlocks = [...config.text.matchAll(/^###\s+Repo:\s*`?([^`\n]+)`?/gim)].filter(
    (m) => !m[1].includes('<COMPLETAR_'),
  );
  if (repoBlocks.length === 0) {
    errors.push('No hay ningun repositorio configurado (todos los bloques tienen placeholders)');
  }

  const relevantPlaceholder = config.tracker === 'notion'
    ? /<COMPLETAR_NOTION_|<COMPLETAR_GITHUB_/
    : /<COMPLETAR_ADO_|<COMPLETAR_ORGANIZATION>|<COMPLETAR_GITHUB_/;
  if (relevantPlaceholder.test(config.text)) {
    errors.push('Quedan placeholders <COMPLETAR_...> del tracker activo sin completar');
  }

  return errors;
}

async function uploadAttachment(org, project, pat, filePath, fileName) {
  const resolvedName = fileName || path.basename(filePath);
  const content = fs.readFileSync(filePath);
  const auth = Buffer.from(`:${pat}`).toString('base64');
  const url = `https://dev.azure.com/${org}/${project}/_apis/wit/attachments?fileName=${encodeURIComponent(resolvedName)}&api-version=7.1`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/octet-stream',
    },
    body: content,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error al subir adjunto: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.url;
}

async function addAttachmentToWorkItem(org, project, pat, workItemId, attachmentUrl, comment) {
  const auth = Buffer.from(`:${pat}`).toString('base64');
  const url = `https://dev.azure.com/${org}/${project}/_apis/wit/workitems/${workItemId}?api-version=7.1`;

  const patch = [
    {
      op: 'add',
      path: '/relations/-',
      value: {
        rel: 'AttachedFile',
        url: attachmentUrl,
        attributes: { comment: comment || '' },
      },
    },
  ];

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json-patch+json',
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error al vincular adjunto: ${res.status} ${body}`);
  }
}

async function main() {
  const command = process.argv[2];
  if (!COMMANDS.has(command)) {
    usage();
    process.exit(command ? 1 : 0);
  }

  if (command === 'validate-config') {
    const configPath = readArg('--config');
    if (!configPath) {
      console.error('Falta --config');
      process.exit(1);
    }
    const errors = validateConfig(configPath);
    if (errors.length > 0) {
      console.error('Config INCOMPLETA:');
      for (const error of errors) console.error(`- ${error}`);
      process.exit(1);
    }
    console.log('Config OK');
    return;
  }

  if (command === 'upload-attachment') {
    const configPath = readArg('--config');
    const workItemId = readArg('--work-item');
    const filePath = readArg('--file');
    const fileName = readArg('--name');
    const comment = readArg('--comment') ?? '';
    const pat = readArg('--pat') ?? process.env.ADO_PAT ?? process.env.AZURE_DEVOPS_EXT_PAT;

    if (!configPath) throw new Error('Falta --config');
    if (!workItemId) throw new Error('Falta --work-item');
    if (!filePath) throw new Error('Falta --file');
    if (!pat) throw new Error('Falta --pat o variable de entorno ADO_PAT / AZURE_DEVOPS_EXT_PAT');

    const config = parseConfig(configPath);
    if (!config.organization || config.organization.includes('<COMPLETAR_'))
      throw new Error('Azure DevOps Organization no configurado en el config');
    if (!config.projectId || config.projectId.includes('<COMPLETAR_'))
      throw new Error('Azure DevOps Project ID no configurado en el config');

    const attachmentUrl = await uploadAttachment(config.organization, config.projectId, pat, filePath, fileName);
    await addAttachmentToWorkItem(config.organization, config.projectId, pat, Number(workItemId), attachmentUrl, comment);

    console.log(`Adjunto cargado: ${attachmentUrl}`);
    console.log(`Vinculado al work item ${workItemId}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
