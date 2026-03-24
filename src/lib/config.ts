import { getApiKey, getApiUrl } from './auth';

export interface CliConfig {
  apiKey: string;
  apiUrl: string;
}

export function loadConfig(): CliConfig {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();

  if (!apiKey) {
    console.error(
      'Not logged in.\n\n' +
      'Run: zenhub login\n\n' +
      'Or set ZENHUB_API_KEY environment variable.',
    );
    process.exit(1);
  }

  return { apiKey, apiUrl };
}
