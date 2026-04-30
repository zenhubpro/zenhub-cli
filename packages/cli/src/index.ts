#!/usr/bin/env node

import { Command } from 'commander';
import { ZenHubClient, getApiKey, getApiUrl } from '@zenhub/client';
import { setJsonMode } from './lib/output';
import { registerAuth } from './commands/auth';
import { registerCampaigns } from './commands/campaigns';
import { registerGroups } from './commands/groups';
import { registerSchedules } from './commands/schedules';
import { registerMessages } from './commands/messages';
import { registerConversations } from './commands/conversations';
import { registerContacts } from './commands/contacts';
import { registerConnections } from './commands/connections';
import { registerStats } from './commands/stats';
import { registerAccessList } from './commands/access-list';
import { registerBlacklist } from './commands/blacklist';

const program = new Command();

program
  .name('zenhub')
  .description(
    'ZenHub CLI — automate WhatsApp campaigns, schedules, groups, and ZenChat from terminal or AI agents',
  )
  .version('0.2.0')
  .option('--json', 'Output raw JSON (for AI agents and scripts)')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.optsWithGlobals();
    if (opts.json) setJsonMode(true);
  });

// Auth commands (don't need API client)
registerAuth(program);

// Lazy client — only initialized when an API command runs
let _client: ZenHubClient | null = null;
function getClient(): ZenHubClient {
  if (!_client) {
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error(
        'Not logged in.\n\nRun: zenhub login\n\nOr set ZENHUB_API_KEY environment variable.',
      );
      process.exit(1);
    }
    _client = new ZenHubClient({ apiKey, apiUrl: getApiUrl() });
  }
  return _client;
}

const client = new Proxy({} as ZenHubClient, {
  get(_, prop) {
    return (getClient() as any)[prop].bind(getClient());
  },
});

registerCampaigns(program, client);
registerGroups(program, client);
registerSchedules(program, client);
registerMessages(program, client);
registerConversations(program, client);
registerContacts(program, client);
registerConnections(program, client);
registerStats(program, client);
registerAccessList(program, client);
registerBlacklist(program, client);

// MCP launcher — `zenhub mcp` runs the stdio MCP server
program
  .command('mcp')
  .description('Start the MCP server (stdio) — for Claude Desktop, Codex, Cursor, Copilot')
  .action(() => {
    require('zenhub-mcp');
  });

program.on('command:*', () => {
  console.error(`Unknown command: ${program.args.join(' ')}\n`);
  program.help();
});

program.parseAsync(process.argv).catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
