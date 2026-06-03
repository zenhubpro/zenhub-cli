import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerRecurring(program: Command, client: ZenHubClient) {
  const cmd = program.command('recurring').description('Manage recurring automations');

  cmd
    .command('list <campaignId>')
    .description('List recurring automations for a campaign')
    .action(async (campaignId) => {
      const res = await client.get(`/v1/campaigns/${campaignId}/recurring`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <campaignId> <automationId>')
    .description('Get a recurring automation')
    .action(async (campaignId, automationId) => {
      const res = await client.get(`/v1/campaigns/${campaignId}/recurring/${automationId}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('toggle <campaignId> <automationId>')
    .description('Toggle a recurring automation')
    .action(async (campaignId, automationId) => {
      const res = await client.patch(`/v1/campaigns/${campaignId}/recurring/${automationId}/toggle`, {});
      if (!res.success) return outputError(res.error!);
      outputSuccess('Recurring automation toggled', res.data);
    });

  cmd
    .command('delete <campaignId> <automationId>')
    .description('Delete a recurring automation')
    .action(async (campaignId, automationId) => {
      const res = await client.del(`/v1/campaigns/${campaignId}/recurring/${automationId}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Recurring automation deleted');
    });
}
