import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerCommunity(program: Command, client: ZenHubClient) {
  const cmd = program.command('community').description('Manage campaign communities');

  cmd
    .command('get <campaignId>')
    .description('Get community for a campaign')
    .action(async (campaignId) => {
      const res = await client.get(`/v1/campaigns/${campaignId}/community`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('create <campaignId>')
    .description('Create a community for a campaign')
    .requiredOption('-n, --name <name>', 'Community name')
    .action(async (campaignId, opts) => {
      const res = await client.post(`/v1/campaigns/${campaignId}/community`, { name: opts.name });
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Community "${opts.name}" created`, res.data);
    });

  cmd
    .command('update <campaignId>')
    .description('Update a community')
    .option('-n, --name <name>', 'New name')
    .option('--description <text>', 'New description')
    .option('--photo-url <url>', 'New photo URL')
    .action(async (campaignId, opts) => {
      const body: Record<string, any> = {};
      if (opts.name) body.name = opts.name;
      if (opts.description) body.description = opts.description;
      if (opts.photoUrl) body.photo_url = opts.photoUrl;
      const res = await client.patch(`/v1/campaigns/${campaignId}/community`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Community updated', res.data);
    });

  cmd
    .command('link-groups <campaignId>')
    .description('Link groups to the community')
    .requiredOption('-g, --groups <ids>', 'Comma-separated group IDs')
    .action(async (campaignId, opts) => {
      const group_ids = opts.groups.split(',').map((s: string) => s.trim());
      const res = await client.post(`/v1/campaigns/${campaignId}/community/link-groups`, { group_ids });
      if (!res.success) return outputError(res.error!);
      outputSuccess(`${group_ids.length} group(s) linked`, res.data);
    });

  cmd
    .command('unlink-groups <campaignId>')
    .description('Unlink groups from the community')
    .requiredOption('-g, --groups <ids>', 'Comma-separated group IDs')
    .action(async (campaignId, opts) => {
      const group_ids = opts.groups.split(',').map((s: string) => s.trim());
      const res = await client.post(`/v1/campaigns/${campaignId}/community/unlink-groups`, { group_ids });
      if (!res.success) return outputError(res.error!);
      outputSuccess(`${group_ids.length} group(s) unlinked`, res.data);
    });
}
