#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig } from './lib/config';
import { ZenHubClient } from './lib/client';
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
  .description('ZenHub CLI — automate WhatsApp campaigns, schedules, groups, and ZenChat from the terminal or AI agents')
  .version('0.1.0')
  .option('--json', 'Output raw JSON (for AI agents and scripts)')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.optsWithGlobals();
    if (opts.json) setJsonMode(true);
  });

// Auth commands (don't need API client)
registerAuth(program);

// Initialize client (deferred — only when a command actually runs)
let _client: ZenHubClient | null = null;
function getClient(): ZenHubClient {
  if (!_client) {
    const config = loadConfig();
    _client = new ZenHubClient(config);
  }
  return _client;
}

// Lazy proxy — client only initializes when first API command runs
const client = new Proxy({} as ZenHubClient, {
  get(_, prop) {
    return (getClient() as any)[prop].bind(getClient());
  },
});

// Register API command groups
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

// Handle unknown commands gracefully
program.on('command:*', () => {
  console.error(`Unknown command: ${program.args.join(' ')}\n`);
  program.help();
});

program.parseAsync(process.argv).catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
