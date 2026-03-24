import { Command } from 'commander';
import { ZenHubClient } from '../lib/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerCampaigns(program: Command, client: ZenHubClient) {
  const cmd = program.command('campaigns').description('Manage campaigns');

  cmd
    .command('list')
    .description('List all campaigns')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get('/v1/campaigns', { page: opts.page, per_page: opts.perPage });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <id>')
    .description('Get campaign details by ID')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('create')
    .description('Create a new campaign')
    .requiredOption('-n, --name <name>', 'Campaign name')
    .option('--description <text>', 'Campaign description')
    .option('--connection <id>', 'Primary WhatsApp connection ID')
    .action(async (opts) => {
      const res = await client.post('/v1/campaigns', {
        name: opts.name,
        description: opts.description,
        primary_connection_id: opts.connection,
      });
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Campaign "${opts.name}" created`, res.data);
    });

  cmd
    .command('update <id>')
    .description('Update a campaign')
    .option('-n, --name <name>', 'New name')
    .option('--description <text>', 'New description')
    .option('--active <bool>', 'Activate/deactivate')
    .action(async (id, opts) => {
      const body: any = {};
      if (opts.name) body.name = opts.name;
      if (opts.description) body.description = opts.description;
      if (opts.active !== undefined) body.is_active = opts.active === 'true';
      const res = await client.patch(`/v1/campaigns/${id}`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Campaign updated', res.data);
    });

  cmd
    .command('delete <id>')
    .description('Delete a campaign')
    .action(async (id) => {
      const res = await client.del(`/v1/campaigns/${id}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Campaign deleted');
    });

  cmd
    .command('stats <id>')
    .description('Get campaign statistics')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}/stats`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('execute <id>')
    .description('Execute campaign immediately')
    .action(async (id) => {
      const res = await client.post(`/v1/campaigns/${id}/execute`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Campaign execution started', res.data);
    });
}
