import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerAutoresponders(program: Command, client: ZenHubClient) {
  const cmd = program.command('autoresponders').description('Manage autoresponders');

  cmd
    .command('list <campaignId>')
    .description('List autoresponders for a campaign')
    .action(async (campaignId) => {
      const res = await client.get(`/v1/campaigns/${campaignId}/automations`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('delete <automationId>')
    .description('Delete an autoresponder')
    .action(async (automationId) => {
      const res = await client.del(`/v1/automations/${automationId}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Autoresponder deleted');
    });
}
