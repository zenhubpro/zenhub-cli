import { Command } from 'commander';
import { ZenHubClient } from '../lib/client';
import {
  saveCredentials,
  loadCredentials,
  clearCredentials,
  openBrowser,
} from '../lib/auth';
import { isJsonMode, output } from '../lib/output';

const API_URL = 'https://api.zenhub.pro/api';
const WEB_URL = 'https://www.zenhub.pro';

function spinner() {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const id = setInterval(() => {
    process.stderr.write(`\r  Aguardando autorização no navegador... ${frames[i++ % frames.length]} `);
  }, 100);
  return { stop: () => { clearInterval(id); process.stderr.write('\r' + ' '.repeat(60) + '\r'); } };
}

export function registerAuth(program: Command) {
  program
    .command('login')
    .description('Authenticate with your ZenHub account')
    .option('--api-url <url>', 'Custom API URL')
    .option('--web-url <url>', 'Custom web URL')
    .action(async (opts) => {
      const apiUrl = opts.apiUrl || API_URL;
      const webUrl = opts.webUrl || WEB_URL;

      console.log('');
      console.log('  \x1b[1mZenHub CLI\x1b[0m — Login');
      console.log('  ─────────────────');

      // Step 1: Create CLI session
      const res = await fetch(`${apiUrl}/auth/cli-session`, { method: 'POST' });
      const session = await res.json() as any;

      if (!session.session_id) {
        console.error('\n  \x1b[31m✗ Não foi possível iniciar a autenticação.\x1b[0m');
        process.exit(1);
      }

      const authUrl = `${webUrl}/cli-auth?session=${session.session_id}`;

      console.log('');
      console.log(`  Código: \x1b[1;36m${session.code}\x1b[0m`);
      console.log('');
      console.log(`  Abrindo navegador...`);
      console.log(`  Ou acesse: \x1b[4m${authUrl}\x1b[0m`);
      console.log('');

      openBrowser(authUrl);

      // Step 2: Poll for authorization
      const s = spinner();
      const startTime = Date.now();
      const timeout = (session.expires_in || 300) * 1000;

      while (Date.now() - startTime < timeout) {
        await new Promise(r => setTimeout(r, 2000));

        try {
          const pollRes = await fetch(`${apiUrl}/auth/cli-session/${session.session_id}`);
          const pollData = await pollRes.json() as any;

          if (pollData.status === 'authorized') {
            s.stop();

            saveCredentials({
              api_key: pollData.api_key,
              api_url: apiUrl,
              user_id: pollData.user_id,
              user_email: pollData.user_email,
              user_name: pollData.user_name,
              organization_id: pollData.organization_id,
              organization_name: pollData.organization_name,
              logged_in_at: new Date().toISOString(),
            });

            console.log('  \x1b[32m✓ Login realizado com sucesso!\x1b[0m');
            console.log('');
            console.log(`  Conta:        ${pollData.user_email}`);
            console.log(`  Organização:  ${pollData.organization_name}`);
            console.log('');
            console.log('  Comece com:');
            console.log('    $ zenhub campaigns list');
            console.log('    $ zenhub chat list --status open');
            console.log('    $ zenhub connections list');
            console.log('');
            return;
          }

          if (pollData.status === 'expired') {
            s.stop();
            console.error('  \x1b[31m✗ Sessão expirou. Tente novamente: zenhub login\x1b[0m\n');
            process.exit(1);
          }
        } catch {
          // Network error — keep polling
        }
      }

      s.stop();
      console.error('  \x1b[31m✗ Tempo esgotado. Tente novamente: zenhub login\x1b[0m\n');
      process.exit(1);
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
        console.log('  \x1b[32m✓\x1b[0m Deslogado. Credenciais removidas.');
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
            console.log('  \x1b[32m✓\x1b[0m Autenticado via variável ZENHUB_API_KEY');
            console.log('');
          }
        } else {
          if (isJsonMode()) {
            output({ authenticated: false });
          } else {
            console.log('');
            console.log('  \x1b[31m✗\x1b[0m Não autenticado.');
            console.log('  Execute: zenhub login');
            console.log('');
          }
        }
        return;
      }

      const client = new ZenHubClient({ apiKey: creds.api_key, apiUrl: creds.api_url });
      const res = await client.get('/v1/connections');

      if (isJsonMode()) {
        output({
          authenticated: res.success,
          user_email: creds.user_email,
          user_name: creds.user_name,
          organization_name: creds.organization_name,
          organization_id: creds.organization_id,
          logged_in_at: creds.logged_in_at,
        });
      } else {
        console.log('');
        if (res.success) {
          console.log('  \x1b[32m✓\x1b[0m Autenticado');
        } else {
          console.log('  \x1b[31m✗\x1b[0m Sessão expirada ou inválida');
          console.log('  Execute: zenhub login');
        }
        if (creds.user_name || creds.user_email) {
          console.log(`  Conta:        ${creds.user_name || ''} <${creds.user_email || ''}>`);
        }
        if (creds.organization_name) {
          console.log(`  Organização:  ${creds.organization_name}`);
        }
        console.log(`  Logado em:    ${new Date(creds.logged_in_at).toLocaleString()}`);
        console.log('');
      }
    });
}
