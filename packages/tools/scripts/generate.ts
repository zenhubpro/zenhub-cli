/**
 * Codegen — generate Zod schemas + tool stubs from /api/docs-json.
 *
 * Usage:
 *   npm run gen --workspace @zenhub/tools
 *
 * Env:
 *   ZENHUB_OPENAPI_URL  — override OpenAPI source (default: prod /api/docs-json)
 *   ZENHUB_OPENAPI_FILE — local file path instead of fetching
 *
 * Output:
 *   src/generated/openapi-paths.json — raw paths reference for diff vs manual tools
 *   src/generated/tool-coverage.md   — markdown report of covered vs missing routes
 */
import * as fs from 'fs';
import * as path from 'path';
import { allTools } from '../src';

const OPENAPI_URL =
  process.env.ZENHUB_OPENAPI_URL || 'https://api.zenhub.pro/api/docs-json';

interface OpenApiSpec {
  paths: Record<string, Record<string, { summary?: string; tags?: string[] }>>;
}

async function loadSpec(): Promise<OpenApiSpec> {
  const file = process.env.ZENHUB_OPENAPI_FILE;
  if (file) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  const res = await fetch(OPENAPI_URL);
  if (!res.ok) throw new Error(`Failed to fetch OpenAPI: HTTP ${res.status}`);
  return res.json() as Promise<OpenApiSpec>;
}

function normalizePath(p: string): string {
  // Strip leading /api prefix used by global prefix in NestJS
  return p.replace(/^\/api/, '').replace(/\{(\w+)\}/g, ':$1');
}

function extractMethodPaths(spec: OpenApiSpec): Array<{ method: string; path: string; summary: string }> {
  const out: Array<{ method: string; path: string; summary: string }> = [];
  for (const [p, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      if (!['get', 'post', 'patch', 'put', 'delete'].includes(method)) continue;
      out.push({
        method: method.toUpperCase(),
        path: normalizePath(p),
        summary: op.summary || '',
      });
    }
  }
  return out;
}

async function main() {
  console.error(`[codegen] fetching ${OPENAPI_URL}...`);
  const spec = await loadSpec();
  const routes = extractMethodPaths(spec);
  const v1Routes = routes.filter((r) => r.path.startsWith('/v1/'));
  console.error(`[codegen] ${routes.length} routes total, ${v1Routes.length} under /v1/`);

  const outDir = path.join(__dirname, '..', 'src', 'generated');
  fs.mkdirSync(outDir, { recursive: true });

  // Coverage report: which v1 routes are NOT covered by any tool
  const coveredPaths = new Set<string>();
  for (const tool of allTools) {
    // Best-effort: parse handler source to find c.METHOD('/v1/...') calls
    const src = tool.handler.toString();
    const matches = src.matchAll(/['"`](\/v1\/[^'"`]+)['"`]/g);
    for (const m of matches) {
      coveredPaths.add(m[1].replace(/\$\{[^}]+\}/g, ':param'));
    }
  }

  const lines: string[] = [
    '# Tool coverage report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Source: ${OPENAPI_URL}`,
    '',
    `**Total v1 routes:** ${v1Routes.length}`,
    `**Tools defined:** ${allTools.length}`,
    '',
    '## Routes WITHOUT a matching tool',
    '',
  ];

  for (const r of v1Routes) {
    const normalized = r.path.replace(/:\w+/g, ':param');
    const covered = [...coveredPaths].some(
      (p) => p.replace(/:\w+/g, ':param') === normalized,
    );
    if (!covered) {
      lines.push(`- \`${r.method} ${r.path}\` — ${r.summary || '(no summary)'}`);
    }
  }

  fs.writeFileSync(path.join(outDir, 'tool-coverage.md'), lines.join('\n'));
  fs.writeFileSync(
    path.join(outDir, 'openapi-paths.json'),
    JSON.stringify(v1Routes, null, 2),
  );

  console.error(`[codegen] wrote ${outDir}/tool-coverage.md and openapi-paths.json`);
}

main().catch((err) => {
  console.error('[codegen] failed:', err);
  process.exit(1);
});
