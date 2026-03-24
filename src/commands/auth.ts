import { Command } from 'commander';
import { ZenHubClient } from '../lib/client';
import {
  saveCredentials,
  loadCredentials,
  clearCredentials,
  prompt,
  promptSecret,
  promptSelect,
} from '../lib/auth';
import { isJsonMode, output } from '../lib/output';

const API_URL = 'https://api.zenhub.pro/api';

export function registerAuth(program: Command) {
  program
    .command('login')
    .description('Authenticate with your ZenHub account')
    .option('--api-url <url>', 'Custom API URL')
    .action(async (opts) => {
      const apiUrl = opts.apiUrl || API_URL;

      console.log('');
      console.log('  \x1b[1mZenHub CLI\x1b[0m — Login');
      console.log('  ─────────────────');
      console.log('');

      // Step 1: Email + Password
      const email = await prompt('  Email: ');
      const password = await promptSecret('  Password: ');

      if (!email || !password) {
        console.error('\n  Email and password are required.');
        process.exit(1);
      }

      // Step 2: Authenticate
      console.log('\n  Authenticating...');

      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json() as any;

      if (!res.ok || !data.token) {
        console.error(`\n  \x1b[31m✗ Login failed: ${data.message || 'Invalid credentials'}\x1b[0m`);
        process.exit(1);
      }

      const jwt = data.token;
      const user = data.user;
      const organizations = data.organizations as { id: string; name: string; role: string }[];

      console.log(`  \x1b[32m✓\x1b[0m Welcome, ${user.name || user.email}!`);

      // Step 3: Select organization
      let selectedOrg: { id: string; name: string; role: string };

      if (organizations.length === 0) {
        console.error('\n  \x1b[31m✗ No organizations found for this account.\x1b[0m');
        process.exit(1);
      } else if (organizations.length === 1) {
        selectedOrg = organizations[0];
        console.log(`  Organization: ${selectedOrg.name}`);
      } else {
        console.log('');
        console.log('  Select an organization:');
        console.log('');
        organizations.forEach((org, i) => {
          const role = org.role === 'owner' ? ' (owner)' : '';
          console.log(`    ${i + 1}. ${org.name}${role}`);
        });
        console.log('');

        const choice = await prompt(`  Choice [1-${organizations.length}]: `);
        const idx = parseInt(choice) - 1;

        if (isNaN(idx) || idx < 0 || idx >= organizations.length) {
          console.error('\n  Invalid selection.');
          process.exit(1);
        }

        selectedOrg = organizations[idx];
      }

      // Step 4: Create API key automatically
      console.log('\n  Setting up CLI access...');

      const keyRes = await fetch(`${apiUrl}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          'X-Organization-Id': selectedOrg.id,
        },
        body: JSON.stringify({
          name: 'ZenHub CLI',
          scopes: ['read', 'write'],
        }),
      });

      const keyData = await keyRes.json() as any;

      if (!keyRes.ok || !keyData.api_key) {
        // If key creation fails, try to find existing CLI key
        console.warn('  Could not create API key automatically.');
        console.error(`  Error: ${keyData.message || 'Unknown error'}`);
        process.exit(1);
      }

      const apiKey = keyData.api_key;

      // Step 5: Save credentials
      saveCredentials({
        api_key: apiKey,
        api_url: apiUrl,
        user_id: user.id,
        user_email: user.email,
        user_name: user.name,
        organization_id: selectedOrg.id,
        organization_name: selectedOrg.name,
        logged_in_at: new Date().toISOString(),
      });

      console.log('');
      console.log('  \x1b[32m✓ Logged in successfully!\x1b[0m');
      console.log('');
      console.log(`  Account:      ${user.email}`);
      console.log(`  Organization: ${selectedOrg.name}`);
      console.log('');
      console.log('  Get started:');
      console.log('    $ zenhub campaigns list');
      console.log('    $ zenhub chat list --status open');
      console.log('    $ zenhub connections list');
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
        console.log('  \x1b[32m✓\x1b[0m Logged out. Credentials removed.');
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
            console.log('  \x1b[32m✓\x1b[0m Authenticated via ZENHUB_API_KEY environment variable');
            console.log('');
          }
        } else {
          if (isJsonMode()) {
            output({ authenticated: false });
          } else {
            console.log('');
            console.log('  \x1b[31m✗\x1b[0m Not logged in.');
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
          user_email: creds.user_email,
          user_name: creds.user_name,
          organization_name: creds.organization_name,
          organization_id: creds.organization_id,
          api_url: creds.api_url,
          logged_in_at: creds.logged_in_at,
        });
      } else {
        console.log('');
        if (res.success) {
          console.log('  \x1b[32m✓\x1b[0m Authenticated');
        } else {
          console.log('  \x1b[31m✗\x1b[0m Session expired or invalid');
          console.log('  Run: zenhub login');
        }
        if (creds.user_name || creds.user_email) {
          console.log(`  Account:      ${creds.user_name || ''} <${creds.user_email || ''}>`);
        }
        if (creds.organization_name) {
          console.log(`  Organization: ${creds.organization_name}`);
        }
        console.log(`  Logged in:    ${new Date(creds.logged_in_at).toLocaleString()}`);
        console.log('');
      }
    });

  program
    .command('switch')
    .description('Switch to a different organization')
    .action(async () => {
      const creds = loadCredentials();
      if (!creds) {
        console.error('\n  Not logged in. Run: zenhub login\n');
        process.exit(1);
      }

      console.log('');
      console.log('  To switch organizations, log in again:');
      console.log('  $ zenhub login');
      console.log('');
      console.log('  This will let you select a different organization.');
      console.log('');
    });
}
