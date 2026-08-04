/** Fetch a non-JSON (e.g. CSV) endpoint and write it to a file or stdout. */
import { writeFileSync } from 'fs';
import { getApiKey, getApiUrl } from '@zenhubpro/client';
import { outputError } from './output';

export async function downloadFile(
  path: string,
  query: Record<string, string | undefined>,
  outputPath?: string,
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('Not logged in.\n\nRun: zenhub login\n\nOr set ZENHUB_API_KEY environment variable.');
    process.exit(1);
  }

  const url = new URL(`${getApiUrl().replace(/\/+$/, '')}${path}`);
  for (const [key, value] of Object.entries(query)) {
    if (value) url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { headers: { 'x-api-key': apiKey } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return outputError(`HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ''}`);
  }

  const body = await res.text();
  if (outputPath) {
    writeFileSync(outputPath, body);
    console.error(`Saved to ${outputPath}`);
  } else {
    process.stdout.write(body);
  }
}
