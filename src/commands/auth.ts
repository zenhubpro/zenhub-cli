import { Command } from 'commander';
import { ZenHubClient } from '../lib/client';
import {
  saveCredentials,
  loadCredentials,
  clearCredentials,
  openBrowser,
  promptSecret,
} from '../lib/auth';
import { isJsonMode, output } from '../lib/output';

const SETTINGS_URL = 'https://www.zenhub.pro/settings/integrations';
const API_URL = 'https://api.zenhub.pro/api';

export function registerAuth(program: Command) {
  program
    .command('login')
    .description('Authenticate with your ZenHub account')
    .option('--api-url <url>', 'Custom API URL')
    .action(async (opts) => {
      const apiUrl = opts.apiUrl || API_URL;

      console.log('');
      console.log('  ZenHub CLI — Login');
      console.log('  ─────────────────');
      console.log('');
      console.log('  Opening your browser to generate an API key...');
      console.log(`  If it doesn't open, go to: ${SETTINGS_URL}`);
      console.log('');

      openBrowser(SETTINGS_URL);

      const apiKey = await promptSecret('  Paste your API key: ');

      if (!apiKey || !apiKey.startsWith('agwpp_live_')) {
        console.error('\n  Invalid API key. It should start with "agwpp_live_"');
        process.exit(1);
      }

      // Validate the key
      console.log('\n  Validating...');
      const client = new ZenHubClient({ apiKey, apiUrl });
      const res = await client.get('/v1/connections');

      if (!res.success) {
        console.error(`\n  Authentication failed: ${res.error}`);
        console.error('  Check your API key and try again.');
        process.exit(1);
      }

      // Try to get org info from campaigns endpoint
      let orgName: string | undefined;
      let ownerEmail: string | undefined;
      try {
        const orgRes = await client.get('/v1/campaigns', { per_page: 1 });
        if (orgRes.data?.[0]?.organization_id) {
          orgName = orgRes.data[0].organization_name;
        }
      } catch {
        // Not critical
      }

      saveCredentials({
        api_key: apiKey,
        api_url: apiUrl,
        organization_name: orgName,
        owner_email: ownerEmail,
        logged_in_at: new Date().toISOString(),
      });

      console.log('');
      console.log('  ✓ Logged in successfully!');
      if (orgName) console.log(`  Organization: ${orgName}`);
      console.log('');
      console.log('  Try: zenhub campaigns list');
      console.log('');
    });

  program
    .command('logout')
    .description('Remove stored credentials')
    .action(() => {
      clearCredentials();
      if (isJsonMode()) {
        output({ success: true, message: 'Logged out' });
      } else {
        console.log('');
        console.log('  ✓ Logged out. Credentials removed.');
        console.log('');
      }
    });

  program
    .command('status')
    .alias('whoami')
    .description('Show current authentication status')
    .action(async () => {
      const creds = loadCredentials();

      if (!creds) {
        if (process.env.ZENHUB_API_KEY) {
          if (isJsonMode()) {
            output({ authenticated: true, method: 'environment_variable' });
          } else {
            console.log('');
            console.log('  ✓ Authenticated via ZENHUB_API_KEY environment variable');
            console.log('');
          }
        } else {
          if (isJsonMode()) {
            output({ authenticated: false });
          } else {
            console.log('');
            console.log('  ✗ Not logged in.');
            console.log('  Run: zenhub login');
            console.log('');
          }
        }
        return;
      }

      // Validate current credentials
      const client = new ZenHubClient({ apiKey: creds.api_key, apiUrl: creds.api_url });
      const res = await client.get('/v1/connections');

      if (isJsonMode()) {
        output({
          authenticated: res.success,
          method: 'credentials_file',
          organization_name: creds.organization_name,
          api_url: creds.api_url,
          logged_in_at: creds.logged_in_at,
          api_key_preview: `${creds.api_key.substring(0, 15)}...${creds.api_key.slice(-4)}`,
        });
      } else {
        console.log('');
        if (res.success) {
          console.log('  ✓ Authenticated');
        } else {
          console.log('  ✗ API key is invalid or expired');
        }
        if (creds.organization_name) {
          console.log(`  Organization: ${creds.organization_name}`);
        }
        console.log(`  API Key: ${creds.api_key.substring(0, 15)}...${creds.api_key.slice(-4)}`);
        console.log(`  API URL: ${creds.api_url}`);
        console.log(`  Logged in: ${new Date(creds.logged_in_at).toLocaleString()}`);
        console.log('');
      }
    });
}
