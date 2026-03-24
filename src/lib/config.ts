export interface CliConfig {
  apiKey: string;
  apiUrl: string;
}

export function loadConfig(): CliConfig {
  const apiKey = process.env.ZENHUB_API_KEY;
  const apiUrl = process.env.ZENHUB_API_URL || 'https://api.zenhub.pro/api';

  if (!apiKey) {
    console.error(
      'Error: ZENHUB_API_KEY not set.\n\n' +
      'Set it as an environment variable:\n' +
      '  export ZENHUB_API_KEY=agwpp_live_xxxxxxxx\n\n' +
      'Or pass inline:\n' +
      '  ZENHUB_API_KEY=agwpp_live_xxx zenhub campaigns list\n\n' +
      'Get your API key at: https://www.zenhub.pro/settings/integrations',
    );
    process.exit(1);
  }

  return { apiKey, apiUrl };
}
