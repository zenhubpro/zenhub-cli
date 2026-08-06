import { execSync, execFileSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';

const PKG = '@zenhubpro/cli';
const CHECK_INTERVAL_MS = 1000 * 60 * 60; // once per hour
const CACHE_DIR = join(homedir(), '.zenhub');
const CACHE_FILE = join(CACHE_DIR, 'update-check.json');

/** true if `b` is a higher x.y.z than `a` (prerelease ignored). */
function isNewer(a: string, b: string): boolean {
  const pa = a.split('-')[0].split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('-')[0].split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pb[i] || 0) > (pa[i] || 0)) return true;
    if ((pb[i] || 0) < (pa[i] || 0)) return false;
  }
  return false;
}

function recentlyChecked(): boolean {
  try {
    if (!existsSync(CACHE_FILE)) return false;
    const { lastCheck } = JSON.parse(readFileSync(CACHE_FILE, 'utf8'));
    return typeof lastCheck === 'number' && Date.now() - lastCheck < CHECK_INTERVAL_MS;
  } catch {
    return false;
  }
}

function markChecked(): void {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeFileSync(CACHE_FILE, JSON.stringify({ lastCheck: Date.now() }));
  } catch {
    /* best-effort */
  }
}

/**
 * Self-updating launcher. On the first run of each day it checks npm for a
 * newer version and, if found, installs it globally and re-runs the command
 * on the new version — same behaviour as the Claude CLI.
 *
 * Always non-fatal: skipped for AI agents (`--json`), in CI, when opted out
 * (`ZENHUB_NO_UPDATE=1`), and silently falls back to a one-line hint if the
 * global install isn't writable (e.g. needs sudo).
 */
export async function autoUpdate(currentVersion: string): Promise<void> {
  if (
    process.argv.includes('--json') ||
    process.env.CI ||
    process.env.ZENHUB_NO_UPDATE ||
    !process.stdout.isTTY ||
    recentlyChecked()
  ) {
    return;
  }

  let latest: string | undefined;
  try {
    const res = await fetch(`https://registry.npmjs.org/${PKG}/latest`, {
      signal: AbortSignal.timeout(3000),
      headers: { accept: 'application/json' },
    });
    if (res.ok) latest = ((await res.json()) as { version?: string }).version;
  } catch {
    /* offline / slow — try again next run */
  }

  // Record the attempt so we don't re-check on every invocation today.
  markChecked();

  if (!latest || !isNewer(currentVersion, latest)) return;

  process.stderr.write(`\n  Atualizando ZenHub CLI ${currentVersion} → ${latest}...\n`);
  try {
    // Resolve npm next to the running node binary so this works under nvm/fnm
    // (where npm may not be on the minimal PATH that execSync's shell sees).
    const nodeDir = dirname(process.execPath);
    const npmBin = existsSync(join(nodeDir, 'npm')) ? `"${join(nodeDir, 'npm')}"` : 'npm';
    execSync(`${npmBin} install -g ${PKG}@latest --no-fund --no-audit`, {
      stdio: 'pipe',
      timeout: 120000,
      env: { ...process.env, PATH: `${nodeDir}:${process.env.PATH ?? ''}` },
    });
  } catch (err) {
    const stderr = (err as { stderr?: Buffer }).stderr?.toString().trim();
    const reason = stderr ? stderr.split('\n').filter(Boolean).pop() : (err as Error).message;
    process.stderr.write(
      `  Não foi possível atualizar automaticamente${reason ? ` (${reason})` : ''}.\n` +
        `  Rode: npm i -g ${PKG}@latest\n\n`,
    );
    return;
  }

  process.stderr.write(`  ✓ Atualizado para ${latest}.\n\n`);

  // Re-run the same command on the freshly installed version.
  try {
    execFileSync(process.argv[0], process.argv.slice(1), { stdio: 'inherit' });
    process.exit(0);
  } catch (err) {
    process.exit((err as { status?: number }).status ?? 0);
  }
}
