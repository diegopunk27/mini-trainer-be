import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const EXEMPT_ROUTES = new Set(['GET /']);

export const COVERED_ROUTES = new Set(['GET /health']);

const HTTP_DECORATOR = /@(Get|Post|Patch|Put|Delete)\(\s*(?:'([^']*)'|"([^"]*)")?\s*\)/g;
const CONTROLLER_DECORATOR = /@Controller\(\s*(?:'([^']*)'|"([^"]*)")?\s*\)/;

export function collectRoutes(sourceRoot: string): string[] {
  const routes: string[] = [];
  for (const file of walk(sourceRoot)) {
    if (!file.endsWith('.controller.ts') && !file.endsWith('health.module.ts')) {
      continue;
    }
    const source = readFileSync(file, 'utf8');
    const controller = CONTROLLER_DECORATOR.exec(source);
    const prefix = controller?.[1] || controller?.[2] || '';
    for (const match of source.matchAll(HTTP_DECORATOR)) {
      const method = match[1].toUpperCase();
      const path = match[2] || match[3] || '';
      const full = `/${[prefix, path].filter(Boolean).join('/')}`.replace(/\/+/g, '/');
      routes.push(`${method} ${full === '' ? '/' : full}`);
    }
  }
  return routes.sort();
}

export function uncoveredRoutes(routes: string[]): string[] {
  return routes.filter((route) => !COVERED_ROUTES.has(route) && !EXEMPT_ROUTES.has(route));
}

function walk(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}
